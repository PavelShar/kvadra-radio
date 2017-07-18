FROM node:alpine

RUN echo 'root:thePassword' | chpasswd

RUN mkdir -p /kvadra-radio
WORKDIR /kvadra-radio

COPY package.json /kvadra-radio
#RUN npm install
RUN npm install pm2 -g
RUN apk add --update mc openssh

RUN echo "UseDNS no" | tee -a /etc/ssh/sshd_config
RUN echo "GSSAPIAuthentication no" | tee -a /etc/ssh/sshd_config
RUN echo "PermitRootLogin yes" | tee -a /etc/ssh/sshd_config


COPY . /kvadra-radio
EXPOSE 80 22
CMD ["/usr/sbin/sshd","-D"]
CMD [ "pm2-docker", "index.js" ]