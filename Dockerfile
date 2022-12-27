# Install Java and set the JAVA_HOME variable
FROM openjdk:8
ENV JAVA_HOME /usr/lib/jvm/java-1.8-openjdk
ENV PATH $PATH:/usr/lib/jvm/java-1.8-openjdk/jre/bin:/usr/lib/jvm/java-1.8-openjdk/bin
 
ENV SBT_VERSION 1.5.8
 
# Install curl and vim
RUN \
  apt-get update && \
  apt-get -y install curl && \
  apt-get -y install vim
 
# Install both scala and sbt
RUN \
  curl -L -o sbt-$SBT_VERSION.deb https://repo.scala-sbt.org/scalasbt/debian/sbt-$SBT_VERSION.deb && \
  dpkg -i sbt-$SBT_VERSION.deb && \
  rm sbt-$SBT_VERSION.deb && \
  apt-get update && \
  apt-get -y install sbt

WORKDIR /var/www
COPY . /var/www
RUN sbt compile

CMD ["sbt","run"]