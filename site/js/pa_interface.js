// This file contains UI contol and such, and runs the game code

// some important constants
const ms_per_frame = 330;
const COLOR_NOT_SELECTED = "#000000";
const COLOR_SELECTED = "#003399";
const wkc = 87;
const upkc = 38;
const skc = 83;
const dnkc = 40
const dkc = 68;
const rikc = 39;
const akc = 65;
const lekc = 37;
const qkc = 81;
const ekc = 69;
const one_kc = 49;
const two_kc = 50;
const three_kc = 51;
const four_kc = 52;
const five_kc = 53;
const six_kc = 54;
const seven_kc = 55;
const eight_kc = 56;
const nine_kc = 57;
const ten_kc = 48;
const eleven_kc = 189;
const tweleve_kc = 187;

// important elements
let rcontrol = document.getElementById("rightctr"); 
let canvas = document.getElementById("gamecanvas");
let curframe = document.getElementById("aniframe");
let cslide = document.getElementById('colorslider');
let cpick = document.getElementById('colorpicker');
let cgroup = document.getElementById('colorgroup');
let rpicker = document.getElementById("rinp");
let gpicker = document.getElementById("ginp");
let bpicker = document.getElementById("binp");
let brushszinp = document.getElementById("brushsz");
let eplayer = document.getElementById("edit_player");
let ecol = document.getElementById("edit_collision");
let ibox = document.getElementById('infobox');
let fselector = document.getElementById('aniframe');

function showinfo() {
    ibox.style.display = "block";
}
function hideinfo() {
    ibox.style.display = "none";
}

// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
    if (event.target == ibox) {
        ibox.style.display = "none";
    }
}

// important state vars
let dirty_draw = false;
let mouse_down = false;
let right_down = false;
let edown = false;
let wdown = false;
let sdown = false;
let ddown = false;
let adown = false;

// get a game instance
console.log("Creating game");
let game = new PixGame(canvas);

function pick_color(hex, hsv, rgb) {
	// reduce the color
	let r = rgb.r & 0xf0;
	let g = rgb.g & 0xf0;
	let b = rgb.b & 0xf0;
	let color = "rgb("+ (r | (r>>4)) +","+ (g | (g>>4)) +","+ (b | (b>>4)) +")";

	cpick.style.backgroundColor = color;
	cgroup.style.backgroundColor = color;
	game.selected_color = PIX_ACTIVE | (r << 4) | (g) | (b >> 4);
	rpicker.value = r >> 4;
	gpicker.value = g >> 4;
	bpicker.value = b >> 4;
}

let colorpicker = ColorPicker(
	cslide,
	cpick,
	pick_color
);

function get_color() {
	colorpicker.setRgb({r:(rpicker.value << 4), g:(gpicker.value << 4), b:(bpicker.value << 4)});
}

let rcontrol_state = true;
function toggle_rightctr() {
	if (rcontrol_state) {
		Velocity(rcontrol, {opacity: 0, translateX: "100%"}, {duration: 500, complete: function(elements) {
			elements[0].style.display = "none";
		}});
	} else {
		Velocity(rcontrol, {opacity: 1, translateX: "0%"}, {duration: 500, begin: function(elements) {
			elements[0].style.display = "block";
		}});
	}
	rcontrol_state = !rcontrol_state;
}

function toggle_editcol() {
	game.selected_collision = !game.selected_collision;
	if (game.selected_collision) {
		ecol.innerText = "Editing Collision";
	} else {
		ecol.innerText = "Edit Collision"
	}
}

function toggle_editplayer() {
	game.selected_player = !game.selected_player;
	if (game.selected_player) {
		eplayer.innerText = "Editing Player";
	} else {
		eplayer.innerText = "Edit Player";
	}
}

function toggle_frame(framebtn) {
	let selected = false;
	let frameid = parseInt(framebtn.id.substr(4), 10);

	selected = toggle_frame_num(frameid);
	return selected;
}

function toggle_frame_num(frameid) {
	frameid -= 1;

	let selected = false;
	// check if it is selected
	let i=0;
	for (; i<game.selected_frames.length; i++) {
		if (game.selected_frames[i] == frameid) {
			selected = true;
			break;
		}
	}

	framebtn = document.getElementById("fsel" + (1 + +(frameid)));

	if (!selected) {
		// select this one now
		framebtn.style.backgroundColor = COLOR_SELECTED;
		game.selected_frames.push(frameid);
	} else {
		// unselect this one
		framebtn.style.backgroundColor = COLOR_NOT_SELECTED;
		game.selected_frames.splice(i, 1);
	}

	return (!selected);
}

let do_animation = true;
function toggle_animation(btnel) {
	do_animation = !do_animation;
	if (do_animation) {
		btnel.innerText = "pause";
	} else {
		btnel.innerText = "play";
	}
}

function change_frame(val) {
	if (val > 12 || val < 1) {
		return;
	}
	game.frame = val-1;
	dirty_draw = true;
}

function change_brushsz(val) {
	game.pensz = val;
	dirty_draw = true;
}

function do_eyedrop() {
	// do eyedropper
	let c = game.getColorSel();
	let r = (c & 0xf00) >> 4;
	let g = (c & 0xf0);
	let b = (c & 0xf) << 4;
	r = r | (r >> 4);
	g = g | (g >> 4);
	b = b | (b >> 4);
	colorpicker.setRgb({r:r, g:g, b:b});
}

let frame_timer = 0;
// start draw loop
function do_update(ts) {
	//console.time("update");
	if (do_animation && frame_timer < ts) {
		frame_timer = ts + ms_per_frame; // schedule next tick
		curframe.value = game.anitick() + 1; // go forward a frame
		dirty_draw = true;
	}
	// move stuff
	let moved = false;
	if (wdown) {
		game.move(move_up);
		moved = true;
	} else if (sdown) {
		game.move(move_down);
		moved = true;
	}
	if (ddown) {
		game.move(move_right);
		moved = true;
	} else if (adown) {
		game.move(move_left);
		moved = true;
	}
	if (moved) {
		dirty_draw = true;
	}

	// draw it
	if (dirty_draw) {
		dirty_draw = false;
		game.draw();
	}
	//console.timeEnd("update");
	window.requestAnimationFrame(do_update);
}
window.requestAnimationFrame(do_update);

// listen for canvas resize
function canvas_resize() {
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;

	game.resetCan();
	dirty_draw = true;
};

window.addEventListener('resize', canvas_resize, false);
canvas_resize();

// register contols
// wasd/arrows - movement
// lmb - draw
// rmb - erase
canvas.addEventListener('mousemove', function(evt) {
	let rect = canvas.getBoundingClientRect();
	let canx = evt.clientX - rect.left;
	let cany = evt.clientY - rect.top;

	if (game.setMouse(game.can2px(canx, cany))) {
		if (right_down || edown) {
			game.colorSel(true);
		} else if (mouse_down) {
			game.colorSel();
		}
		dirty_draw = true;
	}
}, false);
 
canvas.addEventListener('mousedown', function(evt) {
	if (evt.button == 0) {
		// left mouse
		mouse_down = true;
		game.colorSel();
	} else if (evt.button == 2) {
		// right mouse
		right_down = true;
		game.colorSel(true)
	} else if (evt.button == 1) {
		// middle mouse
		do_eyedrop();
	}
	dirty_draw = true;
}, false);

canvas.addEventListener('mouseup', function(evt) {
	if (evt.button == 0) {
		mouse_down = false;
	} else if (evt.button == 2) {
		right_down = false;
	}
}, false);

canvas.addEventListener('wheel', function(evt) {
	var direction = (evt.detail<0 || evt.wheelDelta>0) ? 1 : -1;
	game.pensz += direction;
	if (game.pensz < 1) {
		game.pensz = 1;
	} else if (game.pensz > 18) {
		game.pensz = 18;
	}
	brushszinp.value = game.pensz;
	dirty_draw = true;

	evt.preventDefault();
});

canvas.addEventListener('contextmenu', function(evt) {
	evt.preventDefault();
	return false; // disable context menu
});

document.addEventListener('keydown', function(evt) {
	let movekey = false;
	switch (evt.keyCode) {
	case wkc:
	case upkc:
		wdown = true;
		movekey = true;
		break;
	case skc:
	case dnkc:
		sdown = true;
		movekey = true;
		break;
	case dkc:
	case rikc:
		ddown = true;
		movekey = true;
		break;
	case akc:
	case lekc:
		adown = true;
		movekey = true;
		break;
	case qkc:
		do_eyedrop();
		break;
	case ekc:
		edown = true;
		break;
	case one_kc:
		if (evt.target != fselector) {
			toggle_frame_num(1)
		}
		break;
	case two_kc:
		if (evt.target != fselector) {
			toggle_frame_num(2)
		}
		break;
	case three_kc:
		if (evt.target != fselector) {
			toggle_frame_num(3)
		}
		break;
	case four_kc:
		if (evt.target != fselector) {
			toggle_frame_num(4)
		}
		break;
	case five_kc:
		if (evt.target != fselector) {
			toggle_frame_num(5)
		}
		break;
	case six_kc:
		if (evt.target != fselector) {
			toggle_frame_num(6)
		}
		break;
	case seven_kc:
		if (evt.target != fselector) {
			toggle_frame_num(7)
		}
		break;
	case eight_kc:
		if (evt.target != fselector) {
			toggle_frame_num(8)
		}
		break;
	case nine_kc:
		if (evt.target != fselector) {
			toggle_frame_num(9)
		}
		break;
	case ten_kc:
		if (evt.target != fselector) {
			toggle_frame_num(10)
		}
		break;
	case eleven_kc:
		if (evt.target != fselector) {
			toggle_frame_num(11)
		}
		break;
	case tweleve_kc:
		if (evt.target != fselector) {
			toggle_frame_num(12)
		}
		break;
	}

	if (movekey) {
		game.player.moving = true;
		evt.preventDefault();
	}
}, false);

document.addEventListener('keyup', function(evt) {
	let movekey = false;
	switch (evt.keyCode) {
	case wkc:
	case upkc:
		wdown = false;
		movekey = true;
		break;
	case skc:
	case dnkc:
		sdown = false;
		movekey = true;
		break;
	case dkc:
	case rikc:
		ddown = false;
		movekey = true;
		break;
	case akc:
	case lekc:
		adown = false;
		movekey = true;
		break;
	case ekc:
		edown = false;
		break;
	}
	
	if (movekey) {
		if (!wdown && !adown && !sdown && !ddown) {
			game.player.moving = false;
		}
		evt.preventDefault();
	}
}, false);
