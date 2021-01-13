const encrypt = (m="")=>{
		let e = false;
		function returnError() {
			e = true;
		}
		let encrypted = m.split('').map((v,l)=>{
			if(letters.indexOf(v) > -1) {
				if(letters[letters.indexOf(v)+shift]) {
					return letters[letters.indexOf(v)+shift];
				} else {
					return letters[(letters.indexOf(v)-letters.length)+shift]
				}
			} else {
				returnError();
			}
		}).join('');
		if(e) return false;
		return encrypted;
	},
	decrypt = (m="", s=shift) =>{
		let decrypted = m.split('').map((v,l)=>{
			if(letters.indexOf(v) > -1) {
				if(letters[letters.indexOf(v)-s]) {
					return letters[letters.indexOf(v)-s];
				} else {
					return letters[(letters.indexOf(v)+letters.length)-s]
				}
			}
		}).join('');
		return decrypted
	}

const deleteUser = function(un) {
	if(un in users.data) {
		let u = users.data[un];
		let uid = u.id;
		for(var n in sess.data) {
			if(sess.data[n] == uid) {
				delete sess.data[n];
			}
		}
		if(un in proj.data) {
			delete proj.data[un];
		}
		delete users.data[un];
		return true;
	}
	return false;
}
const deleteAllAccounts = ()=>{
	for(var i in users.data) {
		delete users.data[i];
	}
	for(var p in sess.data) {
		delete sess.data[p];
	}
	for (var j in proj.data) {
		delete proj.data[j];
	}
}

const xssParse = (str)=>{
	try {
		return str.replace(/&/gmi, '&amp;').replace(/</gmi, '&lt;').replace(/>/gmi, '&gt;');
	} catch(e) {
		return 'error';
	}
}

const getJsonObjectFromText = function(txt) {
	let res = '{';
	for(char in txt) {
		if(char == txt.length-1) {
			res+='"'+txt.charAt(char)+'":"'+txt.charAt(char)+'"}';
		} else {
			res+='"'+txt.charAt(char)+'":"'+txt.charAt(char)+'",';
		}
	}

	return res;
} // getJsonObjectFromText("hello"): '{"h":"h","e":"e","l":"l","l":"l","o":"o"}'
const getJsonArrayFromText = function(txt) {
	let res = '[';
	for(char in txt) {
		if(char == txt.length-1) {
			res+='"'+txt.charAt(char)+'"]';
		} else {
			res+='"'+txt.charAt(char)+'",';
		}
	}

	return res;
}

// user json example:
/*
	"user_name": {
		"password": "the_encrypted_key",
		"shift": "the_shift_key_used",
		"id": "the_user_id"
	}
*/

const fs = require('fs'),
	port = 9090,
	express = require("express"),
	app = express(),
	letters = JSON.parse(getJsonArrayFromText("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890#_-")),
	http = require('http').createServer(app),
	io = require('socket.io')(http);

let shift = Math.floor(Math.random() * ((26 * 2) + 13));

if(shift <= 0 || shift == 26 || shift == ((26 * 2) + 13)) {
	function update() {
		shift = Math.floor(Math.random() * ((26 * 2) + 13));

		if(shift <= 0 || shift == 26 || shift == ((26 * 2) + 13)) {
			update();
		}
	}

	update();
}

app.use(express.static("./public_not_logged_in"), express.Router());
//app.use('/p/', express.static("./public_logged_in"), express.Router())
app.use(express.urlencoded());
require('ejs');
app.set('view engine', 'ejs');

const parseCookies = (str='') => {
	if(str == '') {return {}};
	let res = {};
	let sp = str.split(';');
	for(var i = 0; i<sp.length; i++) {
		let sp2 = sp[i].split('=');
		res[sp2[0]] = sp2[1];
	}
	return res;
}

const Database = require('replpersist'),
	users = new Database('user', 0.1, {}),
	sess = new Database('loginid', 0.1, {}),
	proj = new Database('user_project', 0.1, {});

const hasBlacklist = (str, bl='=\'"!@$%^&*-()[]{}\|')=>{
	let has = false;

	for(var i = 0; i<bl.length; i++) {
		let currentBlacklistCharacter = bl.charAt(i);

		if(str.toLowerCase().indexOf(currentBlacklistCharacter) > -1) {
			has = true;
		}
	}

	return has;
}
const starterHtml =
`<!DOCTYPE html>
<html>
	<head>
		<title>Document</title>
		<meta name="viewport" content="width=device-width,initial-scale=1">
	</head>
	<body>

	</body>
</html>`;
const starterHtml2 =
`<!DOCTYPE html>
<html>
	<head>
		<title>Document</title>
		<link href="https://SML.stylerml.repl.co/css-files/gens/sml.css" rel="stylesheet">
		<meta name="viewport" content="width=device-width,initial-scale=1">
	</head>
	<body>
		
	</body>
</html>`;

app.get('/p/del/*', (req,res)=>{
	// console.log(req.params); { project: '' }

	// res.send('Recieved ('+vid+') coming soon.');
	let project = decodeURIComponent(req.url.substring(7));
	let isOwner = false;
	let user = '';

	const cookie = parseCookies(req.headers.cookie);
	if(cookie.loginSess && sess.data[cookie.loginSess]) {
		let userId = sess.data[cookie.loginSess];
		let cuser = '';
		for(var u in users.data) {
			if(users.data[u].id == userId) {
				isOwner = true;
				cuser = u;
			}
		}
		user = cuser;
	} else {
		return res.send('You\'re not logged in');
	}

	// console.log(user);
	
	if(proj.data[user]) {
		if(proj.data[user][project]) {
			if(isOwner) {
				// there is a project
				delete proj.data[user][project];
				res.redirect('../../me');
			} else {
				return res.send('You do not have access to this #2');
			}
		} else {
			return res.send('Unknown project #'+xssParse(project));
		}
	} else {
		return res.send('Unknown user @'+xssParse(user));
	}
});
app.post('/p/create', (req,res)=>{
	const body = req.body;
	/* Body: {
		"name": "project-name",
		"mode": "extensions"
	}*/
	const cookies = parseCookies(req.headers.cookie);
	if(cookies.loginSess && sess.data[cookies.loginSess]) {
		if(hasBlacklist(body.name) === true) {
			return res.send('Name contains blacklisted characters.');
		}
		const uid = sess.data[cookies.loginSess];
		for(var n in users.data) {
			users.data[n].name = n;
			const currentUser = users.data[n];
			if(currentUser.id == uid) {
				// this is the user who is trying to create the project
				/* Object will look like:
					"project_name": {
						"files": {
							"filename.fileext": "file content",
							"foldername": {
								"filename.fileext": "file content"
							}
						}
					}
				*/
				
				if(proj.data[currentUser.name]) {
					if(body.name.trim() == '') {
						return res.redirect('code.html'/*?error=Project name cannot be empty'*/);
					} else {
						// good to go
						if(proj.data[currentUser.name][body.name]) {
							res.redirect('code.html'/*?error=You already have a project with that name'*/);
						} else {
							// good to go
							if(body.m.toLowerCase().startsWith('vanilla')) {
								proj.data[currentUser.name][body.name] = {
									"files": {
										"index.html": starterHtml
									}
								}
							} else {
								proj.data[currentUser.name][body.name] = {
									"files": {
										"index.html": starterHtml2
									}
								}
							}

							// redirect them to the correct page
							res.redirect('ide/'+body.name);
						}
					}
				} else {
					res.send('Error: Missing reserved project path for user @'+xssParse(currentUser.name));
				}
			}
		}
	} else {
		return res.sendFile(__dirname + '/public_not_logged_in/not_logged_in.html');
	}
});
app.get('dt', (req,res)=>{
	res.redirect('index.html#rd');
});
app.get('/p/dt', (req,res)=>{
	const cookies = parseCookies(req.headers.cookie);
	if(cookies.loginSess && sess.data[cookies.loginSess]) {
		res.redirect('../p/index.html')
	} else {
		res.redirect('../index.html#rd');
	}
});
app.get('/p/logout', (req,res)=>{
	const cookies = parseCookies(req.headers.cookie);
	if(cookies.loginSess) {
		res.cookie('loginSess', '', {maxAge: 0});
		res.redirect('../');
	}
});
function mimeFromName(fname) {
	let mimeTypes = {
		"html": "text/html",
		"txt": "text/plain",
		"css": "text/css",
		"js": "application/javascript",
		"svg": "image/svg+xml",
		"png": "image/png",
		"jpg": "image/jpeg",
		"jpeg": "image/jpeg"
	};
	for(var ext in mimeTypes) {
		if(fname.endsWith('.'+ext)) {
			return mimeTypes[ext];
		}
	}

	return 'text/plain';
}
app.get('/p/view/*', (req,res)=>{
	let vid = req.url.substring(8);
	// res.send('Recieved ('+vid+') coming soon.');
	let split = vid.split('/');
	if(split.length < 1) {return res.send('Missing argument');}
	let user = split[0];
	let project = decodeURIComponent(split[1]);
	
	if(proj.data[user]) {
		if(proj.data[user][project]) {
			// there is a project
			project = proj.data[user][project].files;
			split.shift();
			split.shift();
			let fname = 'index.html';
			const filePath = split;

			let displayResult = project;
			//console.log(filePath); [ 'hello', 'world', '' ]
			for(var i = 0; i<filePath.length; i++) {
				if(filePath[i]=='') {filePath.splice(i, 1)} else {
					if(displayResult[filePath[i]]) {
						displayResult = displayResult[filePath[i]];
						fname = filePath[i];
					} else {
						displayResult = '404: #'+xssParse(filePath[i])+'<br>Full:<br>'+xssParse(filePath);
						fname = 'error.html';
					}
				}
			}
			if(displayResult == project) {
				displayResult = displayResult['index.html'];
				fname = 'index.html';
				// console.log(displayResult);
			}
			if(fname == '') {
				displayResult = displayResult['index.html'];
				fname = 'index.html';
			}
			// console.log(displayResult);
			if(typeof displayResult == 'object') {
				displayResult = displayResult['index.html'];
				fname = 'index.html';
			}
			let fileMimeType = mimeFromName(fname);
			//console.log(fileMimeType)
			//console.log(fname);
			res.setHeader('Content-Type', fileMimeType);
			res.send(displayResult);
		} else {
			return res.send('Unknown project #'+xssParse(project));
		}
	} else {
		return res.send('Unknown user @'+xssParse(user));
	}
});
app.get('/p/ide/*', (req,res)=>{
	let vid = req.url.substring(7);
	// res.send('Recieved ('+vid+') coming soon.');
	let project = decodeURIComponent(vid);
	let isOwner = false;
	let user = '';

	const cookie = parseCookies(req.headers.cookie);
	if(cookie.loginSess && sess.data[cookie.loginSess]) {
		let userId = sess.data[cookie.loginSess];
		let cuser = '';
		for(var u in users.data) {
			if(users.data[u].id == userId) {
				isOwner = true;
				cuser = u;
			}
		}
		user = cuser;
	} else {
		return res.send('You\'re not logged in');
	}

	// console.log(user);
	
	if(proj.data[user]) {
		if(proj.data[user][project]) {
			if(isOwner) {
				// there is a project
				const project_f = proj.data[user][project].files;
				
				// other stuff
				res.setHeader('Content-Type', 'text/html');
				res.render('edit.ejs', {
					files: JSON.stringify(project_f) || '{}',
					name: project,
					owner: user
				});
			} else {
				return res.send('You do not have access to this #2');
			}
		} else {
			return res.send('Unknown project #'+xssParse(project));
		}
	} else {
		return res.send('Unknown user @'+xssParse(user));
	}
});
app.get('/me', (req,res)=>{
	let cookies = parseCookies(req.headers.cookie);
	if(cookies.loginSess && sess.data[cookies.loginSess]) {
		let uid = sess.data[cookies.loginSess];
		let name;
		for(var u in users.data) {
			if(users.data[u].id == uid) {
				name = u;
			}
		}
		if(name && name != '') {
			let user_p = proj.data[name];
			res.render('my_account.ejs', {
				user: name,
				projects: JSON.stringify(user_p)
			});
		} else {
			res.send('Error while fetching user');
		}
	} else {
		res.send('You are not logged in!');
	}
});
function atou(b64) {
  return decodeURIComponent(Buffer.from(b64, 'base64').toString('utf-8'));
}
function utoa(data) {
  return Buffer.from(encodeURIComponent(data), 'utf-8').toString('base64');
}
io.on('connection', (socket)=>{
	socket.on('save', (save_info)=>{
		if(save_info && save_info.project && save_info.files) {
			try{
				//console.log('Saving');
				// res.send('Recieved ('+vid+') coming soon.');
				let cproj = save_info.project;
				let data = save_info.files;
				// console.log(data);
				// console.log(data);btoa(unescape(encodeURIComponent('😂')));
				//decodeURIComponent(escape(window.atob('8J+Ygg==')));
				
				const cookies = parseCookies(socket.request.headers.cookie);

				if(cookies.loginSess && sess.data[cookies.loginSess]) {
					let userId = sess.data[cookies.loginSess];
					let user = '';
					let isOwner = false;
					for(var n in users.data) {
						if(users.data[n].id == userId) {
							user = n;
						}
					}
					if(!proj.data[user]) return console.log('missing user');
					if(proj.data[user][cproj]) {
						//console.log('Saving '+cproj+' to', req.body);
						try {
							proj.data[user][cproj].files = JSON.parse(data);
							//console.log(proj.data[user][cproj])
							// res.send('saving')
						} catch(e) {return console.log(e);}
					} else {
						console.log('Unknown project "'+cproj+'"');
					}
				} else {
					console.log('Unknown user')
				}
			} catch(e){return console.log(e);}
		}
	});
});
app.get('/p/index.html', (req,res)=>{
	const cookies = parseCookies(req.headers.cookie);
	if(cookies.loginSess && sess.data[cookies.loginSess]) {
		let user = '';
		let userId = '';
		for(var i in sess.data) {
			if(i == cookies.loginSess) {
				userId = sess.data[i];
			}
		}
		if(userId != '') {
			for(var u in users.data) {
				if(users.data[u].id == userId) {
					user = u;
				}
			}
			res.render('main.ejs', {
				user: user
			});
			return;
		} else {
			res.send('Error fetching UID: <b>'+userId+'</b>');
		}
	} else {
		res.redirect('../not_logged_in.html');
	}
});
app.get('/p/*', (req,res)=>{
	const cookies = parseCookies(req.headers.cookie);
	if(cookies.loginSess && sess.data[cookies.loginSess]) {
		if(fs.existsSync(__dirname + '/public_logged_in/' + req.url.substring(3))) {
			res.sendFile(__dirname + '/public_logged_in/' + req.url.substring(3));
		} else {
			res.send('Error 404: Not found!');
		}
	} else {
		res.redirect('../not_logged_in.html');
	}
});
app.get('/u/*',(req,res)=>{
	let name = req.url.substring(3);
	if(name in users.data) {
		// come back to this
		if(name in proj.data) {
			res.render('view_user.ejs', {
				user: name,
				projects: JSON.stringify(proj.data[name])
			});
		}
	} else {
		res.send('Unknown user');
	}
});

app.get('/*', (req,res)=>{
	const cookies = parseCookies(req.headers.cookie);
	if(cookies.loginSess && sess.data[cookies.loginSess]) {
		return res.redirect('/p/'+req.url);
	}
	let url = req.url.replace(/\?(.*)/gmi, '').replace(/#(.*)/gmi, '')
	if(!fs.existsSync(__dirname + '/public_not_logged_in/' + url)) {
		if(fs.existsSync(__dirname + '/public_not_logged_in/'+url+'.html')) {
			res.redirect(req.url+'.html');
			// console.log(__dirname + '/public/' + url +'.html')
		}
	} else {
		res.redirect("/error-files/404.html")
	}
});

// Session will be stored like
/*
	{
		"session_id": "user_id"
	}
*/
function genId(pattern='SSNRRSSSSNRS',r=Math.floor(Math.random()*5)) {
    if(r==0){r=1}
    let chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let nums = '1234567890';
    let result = '';
    let rands = 'SN';

    for(var rt=0;rt<r;rt++) {
        for(var i=0;i<pattern.length;i++) {
            let cc = pattern.charAt(i).toLowerCase();

            if(cc=='r') {cc=rands.charAt(Math.floor(Math.random()*rands.length)).toLowerCase()}
            
            if(cc=='s') {
                result+=chars.charAt(Math.floor(Math.random()*(chars.length+1)));
            } else if(cc=='n') {
                result+=nums.charAt(Math.floor(Math.random()*nums.length));
            }
        }
    }
    return result;
}

function getSessId() {
	let result = genId('RRRRRRRRRRRR', 5);
	let used = [];

	for(var i in sess.data) {
		for(var x in used) {
			if(result == used[x]) {
				result = genId('RRRRRRRRRRRR', 5);
			}
		}
		if(result == i) {
			used.push(i);
			result = genId('RRRRRRRRRRRR', 5);
		}
	}

	return result;
}
function getUserId() {
	let result = genId('RRRRRRRRRRRR');
	let used = [];

	for(var i in users.data) {
		for(var x in used) {
			if(result == used[x]) {
				result = genId('RRRRRRRRRRRR');
			}
		}
		if(result == i) {
			used.push(i);
			result = genId('RRRRRRRRRRRR');
		}
	}

	return result;
}

// req.headers.cookie = the cookies
app.post('/signup.html', (req,res)=>{
	try {
		// console.log(parseCookies(req.headers.cookie));
		const cookies = parseCookies(req.headers.cookie);
		// console.log(cookies);

		if(cookies.loginSess && sess.data[cookies.loginSess]) {
			res.redirect('/');
		} else {
			// create the account

			//console.log(req.body);
			/*
				Body: 
					{
						"name": "user_name",
						"pass": ["password", "re-password"]
					}
			*/

			if(users.data[req.body.name]) {
				return res.redirect('signup.html?error=Username taken');
			}

			if(req.body.pass[0] != req.body.pass[1]) {
				return res.redirect('signup.html?error=Passwords do not match');
			}
			
			if(req.body.pass[0] == req.body.name) {
				return res.redirect('signup.html?error=Password cannot be the same as username');
			}

			if(req.body.name.trim() == '' || req.body.pass[0].trim() == '') {
				return res.redirect('signup.html?error=Invalid name or password');
			}

			if(encrypt(req.body.pass[0]) == false || encrypt(req.body.name) == false) {
				return res.redirect('signup.html?error=Username or password has invalid characters');
			}

			let userId = getUserId();
			let sessId = getSessId();

			res.cookie('loginSess', sessId, {maxAge: ((1000*60)*24)*9999}); // expires in 2021 xD
			// res.send('set cookie loginSess to '+sessId)

			sess.data[sessId] = userId;
			users.data[req.body.name] = {
				"password": encrypt(req.body.pass[0]),
				"shift": shift,
				"id": userId,
				"name": req.body.name
			};
			proj.data[req.body.name] = {};

			res.redirect('p/created.html');
		}
	} catch(e) {
		console.log(e);
		res.redirect('/error-files/500.html')
	}
});
app.post('/login.html', (req,res)=>{
	try {
		// console.log(parseCookies(req.headers.cookie));
		const cookies = parseCookies(req.headers.cookie);
		// console.log(cookies);

		if(cookies.loginSess && sess.data[cookies.loginSess]) {
			res.redirect('/');
		} else {
			/*
				Body: {
					"name": "user's name",
					"pass": "user's password"
				}
			*/

			const body = req.body;
			if(body.name.trim() == '' || body.pass.trim() == '' || encrypt(body.pass) == false || encrypt(body.name) == false) {
				return res.redirect('login.html?error=Invalid username or password');
			}
			if(users.data[body.name]) {
				if(body.pass == decrypt(users.data[body.name].password, users.data[body.name].shift)) {
					for(var sessId in sess.data) {
						if(sess.data[sessId] == users.data[body.name].id) {
							res.cookie('loginSess', sessId, {maxAge: ((1000*60)*24)*9999});
							res.redirect('p/created.html');
							return;
						}
					}
					console.log('Error getting login id')
				} else {
					// console.log(decrypt(users.data['Battledash2'].password, users.data['Battledash2'].shift));
					return res.redirect('login.html?error=Wrong username or password');
				}
			} else {
				return res.redirect('login.html?error=Wrong username or password');
			}
		}
	} catch(e) {
		console.log(e);
		res.redirect('/error-files/500.html');
	}
});

app.get('/',(req,res)=>{
	res.sendFile(__dirname + "/public_not_logged_in/index.html");
});
http.listen(port, ()=>{
	console.log("listening at "+port);
});

let userlist = Object.keys(proj.data)
console.log(userlist)