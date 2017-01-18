function GamepadControls(gamepadChangeFunction) {
	this.activeGamepads = 0;
	this.callback = gamepadChangeFunction;
	this.lastGamepads = [];
  document.addEventListener("keydown",event => this.onKeyDown.call(this, event));
  document.addEventListener("keyup",event => this.onKeyUp.call(this, event));
}
GamepadControls.prototype = {
	constructor: GamepadControls,
	getGamepads: function() {
		var a = navigator.getGamepads();
		return [a[0], a[1]];
	},
onKeyDown: function(event) {
    if (event.key == "ArrowLeft") {
    	this.callback.call(window, {
				type: "axis-change",
				id: 0,
				key: 0,
				value: -1,
				timestamp: event.timestamp
			});
    } else if (event.key == "ArrowRight") {
    	this.callback.call(window, {
				type: "axis-change",
				id: 0,
				key: 0,
				value: 1,
				timestamp: event.timestamp
			});
    } else if (event.key == "w") {
    	this.callback.call(window, {
				type: "button-dial",
				id: 0,
				key: 7,
				value: 1.5,
				timestamp: event.timestamp
			});
	} else if (event.key == "ArrowDown") {
    		this.callback.call(window, {
				type: "axis-change",
				id: 0,
				key: 1,
				value: 0.8,
				timestamp: event.timestamp
		});
	} else if (event.key == "ArrowUp") {
    		this.callback.call(window, {
				type: "axis-change",
				id: 0,
				key: 1,
				value: -0.8,
				timestamp: event.timestamp
		});
	}
  },
  onKeyUp: function(event) {
//console.log(event.key);
	if (event.key == "ArrowLeft" || event.key == "ArrowRight") {
	    	this.callback.call(window, {
				type: "axis-change",
				id: 0,
				key: 0,
				value: 0,
				timestamp: event.timestamp
			});
	} else if (event.key == "ArrowDown"||event.key == "ArrowUp") {
    		this.callback.call(window, {
				type: "axis-change",
				id: 0,
				key: 1,
				value: 0,
				timestamp: event.timestamp
			});
	}
    },
	update: function() {
		let nowGamepads = this.getGamepads();
		let lastGamepads = this.lastGamepads;
		this.activeGamepads = lastGamepads.length;
		nowGamepads.forEach((obj,i)=>{
			if (obj && obj.id && (obj.id.toLowerCase().indexOf("xbox 360") !== -1)) {
				//this.activeGamepads[i] = i.toString();
				let lastGamepad = lastGamepads[i];
				obj.buttons.forEach((btn,j)=>{
					if (btn.value !== 0 && btn.value !== 1 && ((lastGamepad && lastGamepad.buttons[j] && btn.value !== lastGamepad.buttons[j].value && btn.value !== 0 && btn.value !== 1) || (!lastGamepad)))
						this.callback.call(window, {
							type: "button-dial",
							id: i,
							key: j,
							value: btn.value,
							timestamp: nowGamepads[i].timestamp
						});
					if ((lastGamepad && lastGamepad.buttons[j] && btn.pressed !== lastGamepad.buttons[j].pressed) || (!lastGamepad && btn.pressed))
						this.callback.call(window, {
							type: btn.pressed ? "button-push" : "button-release",
							id: i,
							key: j,
							value: btn.pressed ? 1 : 0,
							timestamp: nowGamepads[i].timestamp
						});
				}
				)
				obj.axes.forEach((axis, j)=>{
					if (lastGamepad && lastGamepad.axes[j] != axis) {
						this.callback.call(window, {
							type: "axis-change",
							id: i,
							key: j,
							value: axis,
							timestamp: nowGamepads[i].timestamp
						});
					}
				}
				);
			}
			this.lastGamepads = [];
			nowGamepads.forEach((obj,i)=>{
				if (obj) {
					let toAdd = {
						id: obj.id,
						buttons: [],
						axes: [],
					};
					obj.buttons.forEach((btn,j)=>{
						toAdd.buttons.push({
							pressed: btn.pressed,
							value: btn.value
						});
					}
					);
					obj.axes.forEach((axis,j)=>{
						toAdd.axes.push(axis);
					}
					);
					this.lastGamepads.push(toAdd);
				} else {
					this.lastGamepads.push(undefined);
				}
			}
			);
		}
		);
	}
}

document.onkeydown = function(event) {
	if (event.key == "ArrowDown") {
		event.preventDefault();
		return false;
	}
	return true;
}