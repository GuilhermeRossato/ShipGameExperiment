var domInterface = document.getElementById("ui");
while (domInterface.firstChild)
	domInterface.removeChild(domInterface.firstChild);
var logger = new Logger(domInterface);
var stats = new StatsEdited(document.body);
stats.begin();
