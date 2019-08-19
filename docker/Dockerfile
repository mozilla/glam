FROM python:3.7
LABEL maintainer="Rob Hudson <robhudson@mozilla.com>"

#RUN apt-get update && \
#    apt-get install -y --no-install-recommends \
#        gcc && \
#    apt-get autoremove -y && \
#    apt-get clean

# Upgrade pip
ADD requirements.txt /app/requirements.txt
RUN pip install --upgrade pip
RUN pip install -r /app/requirements.txt

WORKDIR /app

ADD mdv2 /app/mdv2/
