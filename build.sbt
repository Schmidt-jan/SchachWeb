name := "SchachWeb2"

version := "1.0"

lazy val `schachweb2` = (project in file(".")).enablePlugins(PlayScala)

resolvers += "Akka Snapshot Repository" at "https://repo.akka.io/snapshots/"

scalaVersion := "2.13.5"


libraryDependencies += "net.codingwell" %% "scala-guice" % "5.1.0"

libraryDependencies ++= Seq(jdbc, ehcache, ws, specs2 % Test, guice)
