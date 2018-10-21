require "json"
require "nokogiri"
require "webcache"

class WebCache
  alias_method :orig_http_get, :http_get

  THROTTLED_HOSTS = ['nominatim.openstreetmap.org']

  def http_get(url)
    host = URI.parse(url).host
    if THROTTLED_HOSTS.include?(host)
      print '#'
      sleep 1
    else
      print "."
    end

    orig_http_get(url)
  end
end

CACHE = WebCache.new.tap { |c| c.life = 14*24*60*60 }
PARSED_CACHE = {}

def get_xml(url)
  PARSED_CACHE[url] ||= begin
    Nokogiri::HTML(CACHE.get(url).to_s)
  end
end

def get(url, max_retries: 1)
  retries ||= 0
  PARSED_CACHE[url] ||= begin
    JSON.parse(CACHE.get(url).to_s)
  end
rescue Errno::ENOENT => e
  # cache failed to read file, simply retry and hope the race
  # condition went away
  retries += 1
  if retries < max_retries
    retry
  else
    raise e
  end
rescue JSON::ParserError => e
  retries += 1
  warn "\n\nURL #{url} failed to parse. This was try #{retries} of #{max_retries} #{e}"
  if retries < max_retries
    sleep 5
    retry
  else
    raise e
  end
end
