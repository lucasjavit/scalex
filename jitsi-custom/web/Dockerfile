ARG JITSI_REPO=jitsi
FROM ${JITSI_REPO}/web:stable

# Copy custom configuration files
COPY rootfs/ /

# Copying custom CSS file to override watermark
COPY all.css /usr/share/jitsi-meet/css/all.css

EXPOSE 80 443

VOLUME ["/config", "/etc/letsencrypt", "/usr/share/jitsi-meet/transcripts"]
