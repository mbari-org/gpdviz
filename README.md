# Gpdviz

Gpdviz is a generic, lightweight tool for web-based visualization
of geolocated point data streams in real-time.

This project is a rewrite of a [previous version](https://github.com/gpdviz)
written in Scala/Scala.js.
The overall goal of this new project is to modernize the system in general
while also separating the backend and frontend components to make better
use of associated technologies.
The backend will continue to be written in Scala, initially with minimal
changes wrt previous version to facilitate transition, but later on with
use of more recent library versions and migration to Scala3.
The new frontend will be based on Quasar/Vue3 and Typescript.

**Status**: WiP
