module Geo
  def self.dist(from:, to:)
    raise "expected coord for 'to'" unless is_coord?(to)

    # given a point
    return point2point_dist(lonLat1: from, lonLat2: to) if is_coord?(from)

    # given a line, but only consider ways with reasonably close endpoints (500m)
    start = point2point_dist(lonLat1: from.first, lonLat2: to)
    stop = point2point_dist(lonLat1: from.last, lonLat2: to)
    if start > 500 && stop > 500
      return start > stop ? stop : start
    end

    # less accurate, but twice as fast
    # from.reduce(Float::INFINITY) do |dist, point|
    #   new_dist = point2point_dist(lonLat1: point, lonLat2: to)
    #   new_dist > dist ? dist : new_dist
    # end

    closest = closest_point_on_line(from, to)
    point2point_dist(lonLat1: closest, lonLat2: to)
  end

  def self.is_coord?(coord)
    coord.is_a?(Array) && coord.size == 2 && coord[0].is_a?(Float) && coord[1].is_a?(Float)
  end

  # via https://blog.mapbox.com/fast-geodesic-approximations-with-cheap-ruler-106f229ad016

  # hardcodes values are for Hamburg and in meters
  RATHAUS_LAT = 53.550974

  COS1 = Math.cos(RATHAUS_LAT * Math::PI / 180)
  COS2 = 2 * COS1 * COS1 - 1
  COS3 = 2 * COS1 * COS2 - COS1
  COS4 = 2 * COS1 * COS3 - COS2
  COS5 = 2 * COS1 * COS4 - COS3

  M = 1000 # get meters instead of km
  KX = M * (111.41513 * COS1 - 0.09455 * COS3 + 0.00012 * COS5)
  KY = M * (111.13209 - 0.56605 * COS2 + 0.0012 * COS4)

  def self.point2point_dist(lonLat1:, lonLat2:)
    dx = (lonLat1[0] - lonLat2[0]) * KX
    dy = (lonLat1[1] - lonLat2[1]) * KY
    Math.sqrt(dx * dx + dy * dy)
  end

  def self.bearing(lonLat1:, lonLat2:)
    dx = (lonLat2[0] - lonLat1[0]) * KX
    dy = (lonLat2[1] - lonLat1[1]) * KY
    return 0.0 if dx == 0 && dy == 0
    bearing = to_deg(Math.atan2(dx, dy));
    bearing -= 360 if bearing > 180
    bearing
  end

  def self.line_distance(line)
    total = 0
    line.each_cons(2) { |c1, c2| total += point2point_dist(lonLat1: c1, lonLat2: c2) }
    total
  end

  def self.closest_point_on_line(line, pt)
    minDist = Float::INFINITY
    minX, minY = nil, nil

    (0..line.length-2).each do |i|
      x, y = line[i][0], line[i][1]
      dx = (line[i+1][0] - x) * KX
      dy = (line[i+1][1] - y) * KY

      if dx != 0 || dy != 0
        t = ((pt[0] - x) * KX * dx + (pt[1] - y) * KY * dy) / (dx * dx + dy * dy)
        if t > 1
          x = line[i+1][0]
          y = line[i+1][1]
        elsif t > 0
          x += (dx / KX) * t
          y += (dy / KY) * t
        end
      end

      dx = (pt[0] - x) * KX
      dy = (pt[1] - y) * KY

      sqDist = dx * dx + dy * dy
      next if sqDist >= minDist

      minDist = sqDist
      minX = x
      minY = y
    end

    [minX, minY]
  end

  def self.to_rad(degrees)
    degrees * Math::PI / 180.0
  end

  def self.to_deg(degrees)
    degrees / Math::PI * 180.0
  end
end
