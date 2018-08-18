##############################################################
# copy fresh data from OSM                                   #
##############################################################

FROM debian:unstable-slim as geodata
RUN \
  apt-get -qq update && \
  apt-get -yq install --no-install-recommends \
    ruby ruby-json ruby-bundler ruby-nokogiri zip

WORKDIR /app

COPY Gemfile Gemfile.lock /app/
RUN bundle install

COPY routes.json /app/
COPY routes/ /app/routes/
COPY spec/ /app/spec/

ARG TEST
RUN if [ "$TEST" = "yes" ]; then bundle exec rspec; fi

ARG PRODUCTION
RUN /app/routes/update_relations.rb

##############################################################
# Build the frontend                                         #
##############################################################

FROM node:slim as webpack

WORKDIR /app

COPY yarn.lock package.json /app/
RUN yarn install
ENV PATH="/app/node_modules/.bin:${PATH}"

COPY . /app
COPY --from=geodata /app/routes/geo routes/geo/

ARG PRODUCTION
RUN \
  if [ "$PRODUCTION" = "yes" ]; then \
    svgo routes/geo/*.svg ; \
    webpack --mode production --output-path /bundled/ ; \
  else \
    webpack --output-path /bundled/ ; \
  fi


##############################################################
# COMBINING AND FINISHING TOUCHES                            #
##############################################################

FROM debian:unstable-slim
RUN \
  apt-get -qq update && \
  apt-get -yq install --no-install-recommends \
    brotli inkscape optipng

WORKDIR /artifacts

COPY favicons/ favicons/
RUN favicons/render.sh

COPY --from=webpack /app/routes/geo routes/geo/

COPY --from=webpack /bundled .

ARG PRODUCTION
RUN if [ "$PRODUCTION" = "yes" ]; then optipng -q -o7 favicons/*.png; fi
RUN if [ "$PRODUCTION" = "yes" ]; then \
    FILES=$(find . -type f -not -iname '*.png'); \
    echo "PRODUCTIONing these files:\n${FILES}"; \
    brotli -f --best $FILES & \
    gzip -f -k --best $FILES & \
    wait; \
  fi
