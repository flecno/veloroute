require "nokogiri"

require_relative "geojson"
require_relative "mapillary"
require_relative "markers"
require_relative "place"
require_relative "quality"
require_relative "relation"
require_relative "svg_pather"
require_relative "blog"
require_relative "track"

class Route
  SOURCE = File.expand_path("../routes.json", __dir__)
  PARSED = JSON.parse(File.read(SOURCE))

  @instances = {}

  def self.find(key)
    key = key.to_s
    raise "No route '#{key}'. Only know: #{PARSED.keys.join(', ')}" unless PARSED.has_key?(key)
    @instances[key] ||= self.new(key, PARSED[key])
  end

  def initialize(name, parsed_json)
    @name = name
    @parsed_json = parsed_json.freeze
    @mutex = Mutex.new
    raise "only supports up to two route arms" if route_count > 2
  end

  attr_reader :name

  def relation
    return @relation if @relation
    @mutex.synchronize do
      @relation = Relation.new(relation_id)
    end
  end

  def relation_id
    @parsed_json["relation_id"]
  end

  def track
    @track ||= Track.new(self)
  end

  def osm_url
    "https://www.openstreetmap.org/relation/#{relation_id}"
  end

  def color
    @parsed_json["color"]
  end

  def markers
    m = Markers.new(markers: @parsed_json["markers"].freeze, relation: relation)
    m.snapped
  end

  def named_markers
    markers.map { |m| m + [name] }
  end

  def visited_places
    place_names_with_dir.reject(&:is_dir?)
  end

  def places
    @parsed_json["places"].map do |stops|
      stops.map { |stop| Place.find(stop) }.reject(&:is_dir?)
    end
  end

  def main_route
    @main_route ||= @parsed_json["places"].first.map { |place| Place.find(place) }
  end

  def secondary_route
    @parsed_json["places"].last.map { |place| Place.find(place) }
  end

  def visits?(place)
    places.include?(place)
  end

  def route_count
    @parsed_json["places"].size
  end

  def route_max_length
    @parsed_json["places"].map(&:size).max
  end

  def gpx
    fill = lambda do |text, idx|
      text.gsub('{FIRST}', places[idx].first.to_s).gsub('{LAST}', places[idx].last.to_s)
    end

    @parsed_json["gpx"].map.with_index do |info, idx|
      {
        text:     fill.call(info["text"], idx),
        rev_text: fill.call(info["rev_text"], idx),
        places:   places[idx],
        from:     snap(info["from"]),
        to:       snap(info["to"])
      }
    end
  end

  def route_array
    return main_route if route_count == 1
    main_route.zip(secondary_route).map do |row|
      row.first == row.last ? [row.first, nil] : row
    end
  end

  def stitched_sequences
    @stitched_sequences ||= @parsed_json["images"]&.map do |name, data|
      [name, Mapillary::StitchedSequence.new(data)]
    end.to_h || {}
  end

  def close_image(lonLat, cutOff: 25.0)
    stitched_sequences.values.each do |ss|
      img, dist = ss.closest_img(lonLat)
      return img if dist <= cutOff
    end
    nil
  end

  def to_image_export
    stitched_sequences.map do |name, ss|
      [name, ss.to_json_export]
    end.to_h
  end

  def to_image_debug
    GeoJSON.join(stitched_sequences.values.map(&:to_geojson))
  end

  def to_svg(place2route = {})
    svg = SVGPather.new(color)
    dual = false
    route_array.each.with_index do |row, idx|
      right, left = *row # switch order
      next_right, next_left = *(route_array[idx + 1] || [nil, nil])
      if left && right && !dual
        if left.is_dir?
          # edge case: avoid splitting just to indicate a follow up location
          render_place_line(svg, :center, right, next_right)
          render_place_conn(svg, :center, place2route, :right, right)
          svg.conn(:center, :left)
        else
          svg.split
          dual = true

          svg.split_conn(:left) if has_conn?(place2route, left)
          svg.split_conn(:right) if has_conn?(place2route, right)
          svg.stop(:left) if next_left.nil? && !left.is_dir?
          svg.stop(:right) if next_right.nil? && !right.is_dir?
        end
      elsif dual
        render_place_line(svg, :left, left, next_left)
        render_place_conn(svg, :left, place2route, :left, left)

        render_place_line(svg, :right, right, next_right)
        render_place_conn(svg, :right, place2route, :right, right)
      elsif right
        render_place_line(svg, :center, right, next_right)
        # place conns on other side, since we have the space
        render_place_conn(svg, :center, place2route, :left, right)
      else
        render_place_line(svg, :center, left, next_left)
        # place conns on other side, since we have the space
        render_place_conn(svg, :center, place2route, :right, left)
      end

      svg.commit
    end
    svg.to_s
  end

  def to_html(place2route = {})
    html = <<~EOF
    <div id="desc#{name}" class="desc">
      <table class="routing">
        <tr>
          <td></td>
          <td rowspan="#{route_max_length+1}" style="background-image: url(/routes/geo/route#{name}.svg)">
            <span class="icon icon#{name}">#{name}</span>
          </td>
          <td></td>
        </tr>
    EOF

    dual = false
    route_array.each.with_index do |row, idx|
      right, left = *row # switch order

      # edge case: avoid splitting just to indicate a follow up location
      dual ||= left && right unless left&.is_dir?

      left_conns = get_conn(place2route, left).map(&:to_html_icon).sort.join(" ")
      right_conns = get_conn(place2route, right).map(&:to_html_icon).sort.join(" ")

      # if we have the space, put crossing lines on the other side
      left_conns, right_conns = right_conns, "" if left.nil? && !dual
      right_conns, left_conns = left_conns, "" if right.nil? && !dual

      html << <<~EOF
        <tr>
          <td #{left&.is_dir? ? %|class="dir"| : ""}>#{left_conns} #{left&.link}</td>
          <td #{right&.is_dir? ? %|class="dir"| : ""}>#{right&.link} #{right_conns}</td>
        </tr>
      EOF
    end
    html << <<~EOF
        </table>
        #{download_html}
        #{articles_html}
        #{footer}
      </div>
    EOF
  end

  def to_html_icon
    %|<a href="/#{name}" class="icon icon#{name}">#{name}</a>|
  end

  def to_css
    <<~CSS
      .icon#{name}, .route-icon#{name} {
        background: #{color};
      }
    CSS
  end

  def to_geojson(collisions)
    geojson(collisions).to_geojson
  end

  def to_quality_geojson
    quality.to_geojson
  end

  def to_quality_export
    quality.to_quality_export
  end

  def to_full_feature_list(collisions)
    geojson(collisions).to_full_feature_list
  end

  def ==(other_route)
    name == other_route.name
  end

  private


  def download_html
    <<~HTML
     <h4>Veloroute #{name} Download</h4>
     <p>
        Download im
        <a href="/routes/geo/route#{name}.kml" download><b>KML-Format</b></a>
        oder im
        <a href="/routes/geo/route#{name}.gpx" download><b>GPX-Format</b></a>.
        Alternativ gibt es auch <a href="/routes/geo/routen.zip">alle Routen/Formate im ZIP-Archiv</a>.
        Die Dateien enthalten die Route getrennt nach
        Richtung#{route_count > 1 ? " und Ast" : ""}.
        <br>
        <small>
          Manche Programme können damit nicht umgehen und zeigen entweder alles
          auf einmal oder nur ein Teilstück.
          <span class="not-mobile">
            Empfehlung:
            <a href="https://www.gpxsee.org/" target="_blank">GPXSee</a>
            (kostenlos, Windows / OS X / Linux) zeigt die Exporte korrekt an.
          </span>
        </small>
      </p>
    HTML
  end

  def articles_html
    posts = Blog.instance.with_tags("velo#{name}")
    all = posts.sort_by { |x| x.date }

    links = all.reverse.map do |post|
      title = post.respond_to?(:full_title) ? post.full_title : post.title
      title = title.sub(" (Veloroute #{name})", "")
      title = title.sub(" (Veloroute #{name}, ", " (")
      title = title.sub(", Veloroute #{name})", ")")
      title = title.sub(", Veloroute #{name}, ", "")

      <<~HTML
        <li>
          <time>#{post.ger_date}</time>
          <a href="#{post.url}">#{title}</a>
        </li>
      HTML
    end

    <<~HTML
      <h4>Artikel</h4>
      <ul class="articles single">
        #{links.join("\n")}
      </ul>
    HTML
  end

  def footer
    <<~HTML
      <h4>Navigation</h4>
      <ul>
        <li><a href="/quality">Radwegqualität bewerten</a></li>
        <li><a href="#{osm_url}" target="_blank">Veloroute #{name} in der OpenStreetMap</a></li>
        <li><a href="/">Startseite</a></li>
      </ul>
    HTML
  end

  def geojson(collisions)
    @geojson ||= GeoJSON.new(relation: relation, route: self, collisions: collisions)
  end

  def place_names_with_dir
    @parsed_json["places"].flatten.uniq.map { |place| Place.find(place) }
  end

  def review
    @review ||= ::Review.new(self)
  end

  def quality
    @quality ||= Quality::GeoJSON.new(route: self)
  end

  def get_conn(place2route, place)
    return [] unless place
    raise "Invalid place2route: expected string => route" unless place2route.keys.all? { |p| p.is_a?(String) }
    candidates = place2route[place.name] || []
    candidates = candidates.select { |route| route != self }
    # do not show connections for extremely well connected points (just Rathaus as of now)
    candidates.size >= 4 ? [] : candidates
  end

  def has_conn?(place2route, place)
    return false unless place
    get_conn(place2route, place).any?
  end

  def render_place_line(svg, pos, name, next_name)
    return if name.nil?
    svg.line(pos, name.is_dir?)
    svg.stop(pos) if next_name.nil? && !name.is_dir?
  end

  def render_place_conn(svg, pos, place2route, dir, name)
    return unless has_conn?(place2route, name)
    svg.conn(pos, dir)
  end

  def snap(coord)
    Markers.new(markers: [coord], relation: relation).snapped.first
  end
end
