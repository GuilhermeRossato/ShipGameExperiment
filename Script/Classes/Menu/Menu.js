var menuClick = false;
function Menu(domContainer) {
	this.state = 0;
	this.stateFuture = 0;
	this.active = true;
	this.changed = true;
	this.assert(domContainer instanceof HTMLDivElement, "domContainer should be an DIV elemtn sent as parameter");
	this.assert(menuData, "menuData not found");
	this.domElement = this.createDomElement(domContainer);
	this.domParagraphs = this.createParagraphs();
}

Menu.prototype = {
	constructor: Menu,
	assert: function(condition, message) {
		if (!condition)
			throw message || "Assertion failed";
	},
	createDivWithClass: function(className) {
		let obj = document.createElement("div");
		obj.className = className;
		return obj;
	},
	createDomElement: function(domContainer) {
		let obj = this.createDivWithClass("full-menu");
		domContainer.appendChild(obj);
		let mid = this.createDivWithClass("middle-menu");
		obj.appendChild(mid);
		return mid;
	},
	createParagraphs: function() {
		this.assert(this.domElement, "menu.domElement should already exist when creating paragraphs");
		let ret = [];
		menuData.forEach((obj,i)=>{
			let dom = document.createElement("p");
			dom.innerText = obj.label;
			ret.push(dom);
			this.domElement.appendChild(dom);
		}
		);
		return ret;
	},
	setState: function(id) {
		if (this.stateFuture != id) {
			this.stateFuture = id;
		}
	},
	getState: function(id) {
		return this.stateFuture;
	},
	increaseState: function() {
		if (this.stateFuture > 0) {
			this.stateFuture -= 1;
		}
	},
	decreaseState: function() {
		if (this.stateFuture < menuData.length - 1) {
			this.stateFuture += 1;
		}
	},
	update: function() {
		if (this.state !== this.stateFuture) {
			this.state = (Math.abs(this.state - this.stateFuture) < 0.1)?this.stateFuture:b(this.state, this.stateFuture, 0.2);
		}
		let l = menuData.length-1;
		this.domParagraphs.forEach((dom,i)=>{
			if (dom instanceof HTMLParagraphElement)
				dom.style.fontSize = (interpolate([l, 25], [l/2, 30], [0, 50]).at(Math.abs(this.state-i)))+"px";
		});
	},
	free: function() {
		this.active = false;
		this.domElement.parentNode.style.display = "none";
		//this.domElement.parentNode.parentNode.removeChild(this.domElement.parentNode);
	}
}
