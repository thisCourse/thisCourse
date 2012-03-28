import os
for file in [file.replace(".js", "") for file in os.listdir(".") if file.endswith(".js")]:
    os.system("js2coffee " + file + ".js > " + file + ".coffee")
    f = open(file + ".coffee")
    cs = f.read()
    f.close()
    f = open(file + ".coffee", "w")
    f.write(cs.replace("  ", "    "))
    f.close()
    