from pytm import TM, Server, Datastore, Actor, Dataflow

# proyecto: webgame (pelea de gallos)
tm = TM("webgame threat model local")
tm.description = "analisis de seguridad para el proyecto local de pelea de gallos"

# 1. actores y componentes
jugador = Actor("jugador")
servidor = Server("backend nodejs")
db = Datastore("db local")

# 2. flujos de datos
f1 = Dataflow(jugador, servidor, "peticiones http")
f2 = Dataflow(servidor, db, "consultas sql")

# 3. ejecucion (esto es lo que genera el contenido)
tm.process()