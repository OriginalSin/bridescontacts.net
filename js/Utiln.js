(function() {
var Util = {
	uTimeToDate: function(ut) {
		var d = new Date(ut * 1000),
			zn = d.getDate(),
			pTime = (zn < 10 ? '0':'') + zn;

		zn = d.getMonth() + 1;  pTime += '.' + (zn < 10 ? '0':'') + zn;
		zn = d.getFullYear();   pTime += '.' + zn;
		zn = d.getHours();      pTime += ' ' + (zn < 10 ? '0':'') + zn;
		zn = d.getMinutes();    pTime += ':' + (zn < 10 ? '0':'') + zn;
		return pTime;
	},
	trim: function(zn) {
		return typeof(zn) === 'string' ? zn.trim() : zn;
	},
	getPname: function(it) {
		var fname = it.fname || ' ',
			sname = it.sname || ' ';
		return fname[0].toUpperCase() + fname.substr(1) + ' ' + sname[0].toUpperCase() + '.';
	},
	getUrlParams: function() {
		var out = {
			par: {}
		},
		arr, len;
		if (location.search) {
			arr = location.search.split('&');
			len = arr.length;
			if (arr[0].indexOf('?') === 0) arr[0] = arr[0].substr(1);
			if (arr[len - 1].indexOf('#') === 0) {
				out.achor = arr[len - 1].substr(1);
				len--;
			}
			for (var i = 0; i < len; i++) {
				var pv = arr[i].split('=');
				if (pv.length > 1) out.par[pv[0]] = pv[1];
			}
		}
		arr = location.pathname.match(/(\w+)\.html/);
		out.page = arr && arr.length > 1 ? arr[1] : 'index';
		arr = location.pathname.split('/');
		out.dir = arr && arr.length > 1 ? arr[1] : '';
		return out;
	},
	isAdvancedUpload: function() {
		var div = document.createElement('div');
		return (('draggable' in div) || ('ondragstart' in div && 'ondrop' in div)) && 'FormData' in window && 'FileReader' in window;
	},
    lastId: 1,
    newId: function() {
        return '_' + Util.lastId++;
    },
    uniqueGlobalName: function(thing) {
        var id = Util.newId();
        window[id] = thing;
        return id;
    },
	requestJSONP: function(url, params, options) {
        options = options || {};
		if (User.aLoader) { User.aLoader.classList.remove('collapse'); }
		return new Promise(function(resolve, reject) {
			var cParamName = 'cParamName' in options ? options.cParamName : 'callback',
				urlParams = Util.extend({}, params, User.syncParams),
				out = {options: options, params: params},
				proxyFlag = (location.protocol === 'https:' && url.substr(0, 5) === 'http:');

			urlParams[cParamName] = Util.uniqueGlobalName(function(obj) {
				delete window[urlParams[cParamName]];
				out.res = typeof(obj.Result) === 'string' ? JSON.parse(obj.Result) : obj;
				resolve(out);
				if (User.aLoader) { User.aLoader.classList.add('collapse'); }
			});
			var pArr = [];
			for (var p in urlParams) {
				if (p && (!proxyFlag || p !== cParamName)) {
					pArr.push(p + '=' + encodeURIComponent(urlParams[p]));
				}
			}
			var script = document.createElement('script'),
				parStr = pArr.join('&'),
				src = url + (url.indexOf('?') === -1 ? '?' : '&') + parStr;

 			script.setAttribute('charset', 'UTF-8');
			script.onerror = function(e) {
				out.err = e;
				reject(out);
				script.parentNode.removeChild(script);
				if (User.aLoader) { User.aLoader.classList.add('collapse'); }
			};
			script.onload = function() {
				script.parentNode.removeChild(script);
			};
			if (proxyFlag) {
				User.getLocale();
				parStr += '&tmpSess=' + User.myLocale.tmpSess;
				src = proxyHTTPS + urlParams[cParamName] +'&get=' + url + '?' + encodeURIComponent(parStr);
			}

			script.setAttribute('src', src);
			document.getElementsByTagName('head').item(0).appendChild(script);
		});
    },
	extend: function(dest) {
		var i, j, len, src;

		for (j = 1, len = arguments.length; j < len; j++) {
			src = arguments[j];
			for (i in src) {
				dest[i] = src[i];
			}
		}
		return dest;
	},
	reg: {
		email: /^[-._a-z0-9]+@(?:[a-z0-9][-a-z0-9]+\\.)+[a-z]{2,6}$/,
		test: /^[\\w]+$/
	},
	on: function(node, types, func) {
		types.split(' ').forEach(function(name) {
			node.addEventListener(name, func, true);
		});
		return node;
	},
	off: function(node, types, func) {
		types.split(' ').forEach(function(name) {
			node.removeEventListener(name, func, true);
		});
		return node;
	},
	getNodes: function(name, fromNode) {
		return (fromNode || document).getElementsByClassName(name);
	},
	getNode: function(name, fromNode) {
		return Util.getNodes(name, fromNode)[0];
	},
	createNode: function(name, opt, prnt) {
		var node = document.createElement(name),
			insertBefore = false;
		if (opt) {
			prnt = prnt || opt.parent;
			if (typeof(opt) === 'string') {
				opt = {className: opt};
			}
			if (opt.insertBefore) {
				insertBefore = opt.insertBefore;
			}
			if (opt.className) {
				node.className = opt.className;
			}
			if (opt.innerHTML) {
				node.innerHTML = opt.innerHTML;
			}
			if (opt.src) {
				node.src = opt.src;
			}
			if (opt.href) {
				node.href = opt.href;
			}
			if (opt.attr) {
				for (var key in opt.attr) {
					node.setAttribute(key, opt.attr[key]);
				}
			}
		}
		if (prnt) {
			if (insertBefore) {
				prnt.insertBefore(node, insertBefore === true ? prnt.firstChild : insertBefore);
			} else {
				prnt.appendChild(node);
			}
		}
		return node;
	},
	templates: {
		viewImage: '<div class="ant-modal-mask"></div>\
			<div tabindex="-1" class="ant-modal-wrap ant-modal-mask-hidden" role="dialog" aria-labelledby="rcDialogTitle2">\
				<div role="document" class="ant-modal">\
					<div class="ant-modal-content">\
						<button aria-label="Close" class="ant-modal-close cmdClose"><span class="ant-modal-close-x cmdClose"></span></button>\
						<div class="ant-modal-header">\
							<div class="ant-modal-title" id="rcDialogTitle2"></div>\
							{h_buttons}\
						</div>\
						<div class="ant-modal-body">\
						</div>\
						<div class="ant-modal-footer center">\
							{buttons}\
						</div>\
						<div class="ant-modal-body info">\
						</div>\
					</div>\
					<div tabindex="0" style="width: 0px; height: 0px; overflow: hidden;">sentinel</div>\
				</div>\
			</div>\
		'
	}
};

var host = 'http://russianbrides.com.au', // russianbrides.com.au bridescontacts.net
	cgiURL = host + '/cgi/authn.pl',
	proxyHTTPS = 'https://maps.kosmosnimki.ru/ApiSave.ashx?WrapStyle=Func&CallbackName=',
	urlParams = Util.getUrlParams(),
	pref = urlParams.dir === 'love' ? '..' : '.';

var User = {
	pref: pref,
	urlParams: urlParams,
	cmdSave: Util.getNode('cmdSave'),
	aLoader: Util.createNode('img', {insertBefore: true, src: pref + '/css/img/ajax-loader.gif', className: 'aLoader collapse'}, document.body),
	getFormData: function(formNode) {
		var formData = new FormData();
		for (var i = 0, len = formNode.length; i < len; i++) {
			var it = formNode[i],
				type = it.type;
			formData.append(it.name, Util.trim(it.value));
		}
		for (var key in User.syncParams) {
			formData.append(key, User.syncParams[key]);
		}
		// for(var pair of formData.entries()) {
		   // console.log(pair[0]+ ', '+ pair[1]); 
		// }
		return formData;
	},
	getParamsFormNode: function(formNode) {
		var params = {};
		for (var i = 0, len = formNode.length; i < len; i++) {
			var it = formNode[i],
				type = it.type;
			params[it.name] = Util.trim(it.value);
			if (it.name === 'onum') {
				delete User.syncParams.onum;
			}
		}
		return Util.extend({}, params, User.syncParams);
	},
	parseMessCode: function(code) {
		if (code === 'ok') {
			code = 'Message was sent successfully'
		}
		return code;
	},
	clickEvent: function(ev, skip) {
		var node = ev.target,
			cmd = node.getAttribute('dataCmd'),
			dataForm = node.getAttribute('dataForm'),
			page = '';
		if (cmd === 'openImageDialog') {
			Galer._viewImagesDialog(ev);
			return;
		} else if (cmd === 'cmdTalkRoom') {
			var usr = User.par.usr || window.gender || User.myLocale.usr || 'w';
			
			page = './anketa.html?usr=' + usr;
			if (User.profile) {
				page = '/talk.html?usr=' + User.profile.usr + '&to=' + Galer._currentItem.onum;
				if (User.profile.usr === 'w' && User.profile.pub != 1) {
					alert('Вам необходимо дождаться верификации вашего аккаунта!');
					page = 'verify.html?usr=' + User.profile.usr;
				}
			}
			location.href = page;
			return;
		} else if (cmd === 'cmdGetAddress') {
			location.href = './address.html?to=' + Galer._currentItem.onum;
			return;
		} else if (cmd === 'cmdLastlocation') {
			location.href = '/maps/myLocation.html?ip=' + User.auth.ip;
			return;
		} else if (cmd === 'cmdCopyLink') {
		}
		if (dataForm && cmd) {
			var frm = document.forms[dataForm],
				err = Util.getNode('form-error', frm);
			var par = User.getParamsFormNode(frm);
			if (cmd === 'cmdReg' || cmd === 'cmdAuth') {
				var tusr = Util.trim(frm.usr.value);
				if (window.gender !== tusr) {
					page = (tusr === 'w' ? '/love' : '') + '/registration.html?usr=' + tusr;
					location.href = page;
					return;
				}
			} else if (cmd === 'cmdInfo' || cmd === 'cmdSaveProfile') {
				User.saveProfile(frm, cmd);
				return;
			} else if (cmd === 'cmdMess') {
				par.faq = 1;
				frm.femail.value = '';
				frm.name.value = '';
				frm.text.value = '';
			} else if (cmd === 'cmdTalk') {
				par.page = 'talkn';
				par.charset = 'windows-1251';
				par.notAnswer = 1;
				par.uAttr = 1;
				par.to = User.urlParams.par.to || User.urlParams.par.ns || 1;
				if (par.msg) {
					if (skip) {
						delete par.subj;
						delete par.msg;
					} else {
						par.subj = encodeURIComponent(par.subj);
						par.msg = encodeURIComponent(par.msg);
						frm.subj.value = '';
						frm.msg.value = '';
					}
				}
			}

			if (err) err.classList.add('collapse');
			return Util.requestJSONP(cgiURL, par, {callbackParamName: 'callback'}).then(function(json) {
				// console.log('requestJSONP', json);
				if (json.res) {
					if (err && json.res.mess) {
						err.innerHTML = User.parseMessCode(json.res.mess);
						err.classList.remove('collapse');
					}
					var auth = json.res.AUTH || {};
					if (auth.err) {
						if (err && auth.mess && !json.res.mess) {
							err.innerHTML = auth.mess;
							err.classList.remove('collapse');
						}
						if (cmd === 'cmdDel') {
							location.href = './mgaler.html?usr=' + auth.usr;
						}
					} else {
						page = './register_id.html?usr=' + auth.usr;
						if (cmd === 'cmdReg') {
							page = './register_id.html?usr=' + auth.usr;
						} else if (cmd === 'cmdTalk') {
							User.talk = json.res.talk;
							if (User.talk) {
								Talk.parse();
								// page = './talk.html?usr=' + auth.usr + '&to=' + par.to;
								return;
							} else if (User.profile && User.profile.usr === 'm' && !User.profile.accOk) {
								page = './services/index.html?usr=' + auth.usr;
							}
						} else if (cmd === 'cmdDel') {
							page = './mgaler.html?usr=' + auth.usr;
						} else if (cmd === 'cmdAuth') {
							page = './anketa.html?usr=' + auth.usr;
							if (auth.fname) {
								page = auth.usr === 'w' ? 'm' : 'w';
								page += 'galer.html?usr=' + auth.usr;
							}
							if (User.urlParams.par.toPage === 'services') {
								page = './services/index.html?toLink=' + User.urlParams.par.toLink + '&usr=' + auth.usr;
							}
						}
						location.href = page;
					}
				}
			});
		}
	},
	cgiURL: cgiURL,
	syncParams: {
		notAnswer: 1
	},
	par: {},
	profile: null,
	myLocale: {},
	auth: {},
	galer: {},
	needProfile: true,
	editIcons1: '<div class="rb-icons collapse"><span class="rb-left" title="Rotate photo"><i class="anticon anticon-loading-3-quarters cmdRotate"></i></span><span class="rb-right" title="Delete photo"><i class="anticon anticon-close-circle cmdImageDel"></i></span></div>',
	editIcons: '',
	rbProfileForm: Util.getNode('rb-form-profile'),
	oprosInfo: Util.getNode('oprosInfo'),
	rbPublishForm: Util.getNode('oprosPublish'),
	saveLocale: function(it) {
		if (it) { Util.extend(User.myLocale, it); }
		localStorage._rbLocale = JSON.stringify(User.myLocale);
	},
	getLocale: function() {
		var arr = navigator.languages,
			len = arr.length,
			isRus = false;
	
		for (var i = 0; i < len; i++) {
			if (arr[i].indexOf('ru') === 0) {isRus = true; break;}
		}
		if (localStorage._rbLocale) {
			User.myLocale = JSON.parse(localStorage._rbLocale);
		} else {
			User.saveLocale({
				usr: isRus ? 'w' : 'm',
				lastPage: location.href,
				isRus: isRus
			});
		}
	},
	_getLocation: function(ip) {
		if (location.protocol === 'http:') {
			var url = '//ip-api.com/json/' + ip;

			Util.requestJSONP(url, {}, {callbackParamName: 'callback'}).then(function(json) {
				User.saveLocale({
					addr: json.res
				});
				Util.extend(User.syncParams, json.res);
			});
		}
	},
	_chkUserOnToggle: function() {
		var lists = Util.getNodes('userOnToggle'),
			op = 'add',
			onum = '';
		if (User.profile) {
			op = 'remove';
			onum = User.profile.onum;
			User._chkProfileItems(User.profile);
		}

		for(var i = 0, len = lists.length; i < len; i++) {
			var node = lists[i];
			node.classList[op]('collapse');
			if (node.tagName.toLowerCase() === 'form') {
				if (node.os1) { node.os1.value = onum; }
			}
		}
		lists = Util.getNodes('userOffToggle');
		op = User.profile ? 'add' : 'remove';
		for(var i = 0, len = lists.length; i < len; i++) {
			lists[i].classList[op]('collapse');
		}
	},
	_chkProfileItems: function(it, node) {
		var arr = Object.keys(it.pdata).concat(Object.keys(it));
		arr.forEach(function(key) {
			var list = Util.getNodes('rb-item-' + key, node),
				zn = it[key] || it.pdata[key];
			for (var i = 0, len = list.length; i < len; i++) {
				list[i].innerHTML = zn;
			}
		});
	},
	_menuReady: false,
	_chkProfile: function() {
		if (!User.auth.err) {
			var nodeForm = User.rbProfileForm,
				prof = User.auth;

			if (prof.pdata) {
				User.needProfile = false;
				delete User.syncParams.notAnswer;
				var op1 = Number(prof.op1) || 0;
				if (op1) {
					var date = new Date(1000 * op1),
						st = '',
						zn = date.getDate();

					if (zn < 10) { zn = '0' + zn; }
					st += zn;
					zn = 1 + date.getMonth();
					if (zn < 10) { zn = '0' + zn; }
					st += '.' + zn;
					zn = date.getFullYear();
					st += '.' + zn;
					zn = 'red';
					if(date.getTime() > (new Date()).getTime()) {
						zn = 'white';
						prof.accOk = 1;
					}
					prof.accContain = '<b style="color:' + zn +'">' + st + '</b>';
				}
				prof.pName = Util.getPname(prof);
			}
			User.saveLocale({
				tmpSess: prof.tmpSess
			});
			var page = User.urlParams.page;
			if (prof.usr === 'm' && !prof.accOk) {
				if (page === 'talk' || page === 'address') {
					location.href = './services/index.html';
					return;
				}
			} else if (page === 'talk' && prof.usr === 'w' && prof.pub != 1) {
					location.href = './love/mgaler.html';
					return;
			}

			User._prpItemImages(prof);
			User.profile = prof;
			User._addImages();
			User.syncParams.usr = prof.usr;
			User.syncParams.onum = prof.onum;

if (!User._menuReady && Menu.rbMenuManContent) {
	Menu.rbMenuManContent.innerHTML = Menu.getMainMenu();
	User._menuReady = true;
}
			if (User.rbPublishForm) {
				nodeForm = User.rbPublishForm;
			}
			if (nodeForm) {
				User._parseForm(nodeForm, prof);
				if (User.oprosInfo) {
					User._parseForm(User.oprosInfo, prof);
				}

				// Util.on(Util.getNode('cmdSaveProfile'), 'click', User.saveProfile);
				if (Util.isAdvancedUpload) {
					Util.on(document.body, 'drag dragstart dragend dragover dragenter dragleave drop', function(e) {
						e.preventDefault();
						e.stopPropagation();
					});
					Util.on(document.body, 'drop', function(ev) {
						User._addNewImages(ev.dataTransfer.files);
					});
					
					Util.on(Util.getNode('addFile', nodeForm), 'change', User._changeProfileImage);
				}
				
				// Util.on(Util.getNode('dialog-pictures'), 'click', User._dialogClick);
			}
		} else {
			delete User.profile;
			var lists = Util.getNodes('rb-item-pName');
			for(var i = 0, len = lists.length; i < len; i++) {
				lists[i].innerHTML = '';
			}
			var urlParams = User.urlParams;
			if (urlParams.page === 'talk') {
				location.href = (User.auth.usr === 'm' ? './' : './love/') + 'register_id.html?usr=' + User.auth.usr;
			} else if (urlParams.page === 'anketa') {
				location.href = './register_id.html?usr=' + User.auth.usr;
			}
		}
		if (User.auth.ip && !User.myLocale.addr) {
			User._getLocation(User.auth.ip);
		}
		User._chkUserOnToggle();
	},
	_parseForm: function(nodeForm, prof) {
		var dop = {
			everBlock: prof.ever == 1 ? 'подтвержден' : 'не подтвержден',
			profileTitle: 'Анкета - ID=' + prof.onum	// + ' Пароль=' + prof.pass
		};
		for (var i = 0, len = nodeForm.length; i < len; i++) {
			var it = nodeForm[i],
				type = it.type;
			if (type === 'submit' || type === 'reset') { continue; }

			var name = it.name,
				zn = User.auth[name] || User.auth.pdata[name] || '',
				tagName = it.tagName.toLowerCase();

			if (name === 'yy' && zn < 1900) {
				zn = 1980;
			}
			if (type === 'checkbox') {
				it.checked = Number(zn);
			} else if (tagName === 'input' || tagName === 'textarea') {
				it.value = zn;
			} else if (tagName === 'select') {
				for (var j = 0, len1 = it.options.length; j < len1; j++) {
					if (it.options[j].value === zn) {
						it.selectedIndex = j;
						break;
					}
				}
			}
		}
		for (var key in dop) {
			var nodes = Util.getNodes(key, nodeForm),
				zn = dop[key];
			for (var i = 0, len = nodes.length; i < len; i++) {
				nodes[i].innerHTML = zn;
			}
		}
	},
	_changeProfileImage: function(ev) {
		User._addNewImages(ev.target.files);
	},
	_prpItemImages: function(profile) {
		if (!profile.pdata.images) {
			var arr = [],
			name = '_jpg2',
			it = profile[name] || profile.pdata[name];
			if(it) {arr.push({src: it});}
			name = '_jpg1';
			it = profile[name] || profile.pdata[name];
			if(it) {arr.push({src: it});}
			name = '_jpg3';
			it = profile[name] || profile.pdata[name];
			if(it) {arr.push({src: it});}
			profile.pdata.images = arr;
		}
		return profile.pdata.images;
	},
	_fileToImage: function(file, img) {
		var reader = new FileReader();
		reader.onload = function (e) {
			img.src = e.target.result;
		};
		reader.readAsDataURL(file);
	},
	_addNewImages: function(files) {
		if (files && files.length) {
			var nodeForm = User.rbProfileForm,
				rbImages = Util.getNode('box-pictures', nodeForm),
				lastNum = rbImages.children.length;
			User.dopFiles = User.dopFiles || {};
			for (var i = 0, len = files.length; i < len; i++) {
				var file = files[i],
					key = file.name + '_' + file.size + '_' + file.lastModified;
				if (file.size) { //  && file.size < 3000000
					User.dopFiles[key] = {
						file: file
					};
					// var node = Util.createNode('span', {className: 'box-picture', innerHTML: User.editIcons}, rbImages),
					var node = Util.createNode('span', {className: 'box-picture'}, rbImages),
						img = Util.createNode('img', {className: 'rb-src-jpg', attr:{dataKey: key}}, node),
						span = Util.createNode('span', null, node);
						
					User._fileToImage(file, img);
				}
			}
		}
	},
	_setTransform: function(node, deg) {
		var transform = '',
			rotate = (node._rotate || 0) + deg;

		rotate %= 360;
		node._rotate = rotate;
		transform = 'rotate(' + rotate + 'deg)';
		node.style.transform = transform;
	},
	_dialogClick: function(ev) {
		var node = ev.target,
			dialogPictures = Util.getNode('dialog-pictures'),
			img = Util.getNode('rb-view-image', dialogPictures),

			dataKey = img.getAttribute('dataKey'),
			dopFiles = User.dopFiles || {},
			images = User.profile ? User.profile.pdata.images : [];
		if (node.classList.contains('cmdClose')) {
			Util.getNode('dialog-pictures').classList.toggle('collapse');
		} else if (node.classList.contains('cmdPrev') || node.classList.contains('cmdNext')) {
			var footer = Util.getNode('ant-modal-footer', dialogPictures),
				nm = Galer._currentItemImage,
				pimages = Galer._currentItem.pdata.images;

			nm += (node.classList.contains('cmdPrev') ? -1 : 1);
			if (nm < 0) {
				nm =  pimages.length - 1;
			} else if (nm >=  pimages.length) {
				nm = 0;
			}
			Galer._currentItemImage = nm;
			var pt = pimages[nm];
			img.src = host + '/' + pt.src;
			// img.onload = window.RB.Galer.itemRotate(img, img.rotate, img.naturalWidth, img.naturalHeight);
			if (pt.rotate) { img.style.transform = 'rotate(' + pt.rotate + 'deg)'; }
			if (footer) { footer.innerHTML = '<span class="round rb-absolute">' + (nm + 1) + '</span'; }
		} else if (node.classList.contains('cmdDelete')) {
			// if (dopFiles.dataKey) {
				// delete dopFiles.dataKey;
			// } else {
				// images.splice(Number(dataKey) - 1, 1);
			// }
			var simg = User._findImageByKey(dataKey);
			simg.parentNode.remove(simg);
			Util.getNode('dialog-pictures').classList.toggle('collapse');
		} else if (node.classList.contains('cmdRotate')) {
			User._setTransform(img, -90);
			var imgAttr = dopFiles[dataKey] || images[dataKey - 1];
			imgAttr.rotate = img._rotate;
			var simg = User._findImageByKey(dataKey);
			simg.style.transform = 'rotate(' + imgAttr.rotate + 'deg)';
		}
	},
	_imageClick: function(ev) {
		var img = ev.target,
			tagName = img.tagName.toLowerCase();
		if (tagName === 'img') {
			var dialogNode = Util.getNode('dialog-pictures'),
				tmp = Util.templates.viewImage;
			tmp = tmp.replace('{h_buttons}', '').replace('{buttons}', '\
				<button type="button" class="ant-btn ant-btn-primary ant-btn-lg cmdDelete"><span>Delete</span></button>\
				<button type="button" class="ant-btn ant-btn-primary ant-btn-lg cmdRotate"><span>Rotate</span></button>\
				<button type="button" class="ant-btn ant-btn-primary ant-btn-lg cmdClose"><span>Done</span></button>');

			dialogNode.innerHTML = tmp;
			var body = Util.getNode('ant-modal-body'),
				dataKey = img.getAttribute('dataKey');

			body.innerHTML = '<img class="rb-view-image" src="'+ img.src +'" dataKey="'+ dataKey +'" />';
			dialogNode.classList.toggle('collapse');
			User._setTransform(Util.getNode('rb-view-image', body), img._rotate);
		}
	},
	_findImageByKey: function(key) {
		var nodeForm = User.rbProfileForm,
			rbImages = Util.getNode('box-pictures', nodeForm);
	
		if (rbImages) {
			for(var i = 0, len = rbImages.children.length; i < len; i++) {
				var node = rbImages.children[i],
					img = Util.getNode('rb-src-jpg', node);
				if (key === img.getAttribute('dataKey')) return img;
			}
		}
		return null;
	},
	_addImages: function(images, active) {
		var images = User.profile.pdata.images,
			nodeForm = User.rbProfileForm,
			rbImages = Util.getNode('box-pictures', nodeForm),
			nm = 0;
	
		if (rbImages) {
			rbImages.innerHTML = '';
			for(var i = 0, len = images.length; i < len; i++) {
				nm++;
				var attr = images[i];
				// var node = Util.createNode('span', {className: 'box-picture', innerHTML: User.editIcons}, rbImages),
				var node = Util.createNode('span', {className: 'box-picture'}, rbImages),
					img = Util.createNode('img', {className: 'rb-src-jpg', attr:{dataKey: nm}}, node),
					span = Util.createNode('span', null, node);
				img.src = host + '/'+ attr.src;
				User._setTransform(img, attr.rotate);
			}
			Util.on(rbImages, 'click', User._imageClick);
		}
	},
	_getMaxNumImages: function(images) {
		var nm = 0;
		images.forEach(function(it) {
			var arr = it.src.match(/_(\d+)a\.jpg/);
			nm = Math.max(nm, Number(arr[1]));
		});
		return nm;
	},
	_resizeImage: function(file, name) {
		return new Promise(function(resolve) {
			var img = new Image();
			var reader = new FileReader();
			reader.onload = function (e) {
				img.src = e.target.result;
			};
			reader.readAsDataURL(file);
			img.onload = function () {
				var canvas = Util.createNode('canvas'),
					sl = (img.naturalWidth - 632) / 2,
					st = (img.naturalHeight - 948) / 2,
					scw = 632 / img.naturalWidth,
					sch = 948 / img.naturalHeight,
					sc = Math.min(scw, sch),
					asp = 632 / 948;

				canvas.width = img.naturalWidth * sc;
				canvas.height = img.naturalHeight * sc; // / aspectRatio;
				canvas.getContext('2d').drawImage(img, 0, 0, img.naturalWidth, img.naturalHeight, 0, 0, canvas.width, canvas.height);
				canvas.toBlob(function (blob) {
					resolve({file: file, blob: blob, name: name});
				}, 'image/jpeg');
			};
		});
	},

	saveProfile: function(frm, cmd) {
		var formData = new FormData(),
			profile = User.profile,
			images = profile.pdata.images,
			dopFiles = User.dopFiles || {},
			nm = User._getMaxNumImages(images),
			nodeForm = frm || User.rbProfileForm,
			rbImages = Util.getNode('box-pictures', nodeForm),
			arr = [];

		if (rbImages) {
			var out = [];
			for (var i = 0, len = rbImages.children.length; i < len; i++) {
				var node = rbImages.children[i],
					img = Util.getNode('rb-src-jpg', node),
					attrkey = img.getAttribute('dataKey'),
					it = dopFiles[attrkey];
				if (it) {
					nm++;
					var name = profile.onum + '_'  + nm + 'a.jpg';
					//formData.append(name, it.file);
					arr.push(User._resizeImage(it.file, name));
					out.push({src: 'jpeg/' + profile.usr + '/0/' + name, rotate: img._rotate || 0});
				} else {
					out.push({src: images[Number(attrkey) - 1].src, rotate: img._rotate || 0});
				}
			}
			formData.append('images', JSON.stringify(out));
		}
		if (User.myLocale) {
			formData.append('myLocale', JSON.stringify(User.myLocale));
		}
		if (User.oprosInfo) {
			formData.append('fname', Util.trim(User.oprosInfo.fname.value));
			formData.append('sname', Util.trim(User.oprosInfo.sname.value));
			formData.append('mobile', Util.trim(User.oprosInfo.mobile.value));
			formData.append('icq', Util.trim(User.oprosInfo.icq.value));
			formData.append('subs', Util.trim(User.oprosInfo.subs.value));
			formData.append('subfn', Util.trim(User.oprosInfo.subfn.value));
		}

		formData.append('onum', profile.onum);
		formData.append('usr', profile.usr);
		formData.append('json', 1);
		formData.append('profile', 1);
		// var form = Util.getNode('rb-form-profile', Util.getNode('rb-item-detail'));
		for (var i = 0, len = nodeForm.length; i < len; i++) {
			var it = nodeForm[i];
			formData.append(it.name, Util.trim(it.value));
		}

		Promise.all(arr)
			.then(function(arr) {
				console.log('Promise.all', arr)
				for (var i = 0, len = arr.length; i < len; i++) {
					var it = arr[i];
					formData.append(it.name, it.blob, it.name);
				}
				fetch(cgiURL, {
					method: 'POST',
					mode: 'cors',
					redirect: 'follow',
					credentials: 'include',
					body: formData
				  })
				  .then(function(response) {return response.json();})
				  .catch(console.error)
				  .then(function(response) {
					  // console.log('Success:', response);
					  var usr = response.AUTH.usr,
						pref = usr === 'w' ? 'mgaler' : 'wgaler';
					  location.href = pref + '.html?usr=' + usr;
				});
		
			}, function() {
				console.log('err', arguments)
			});
	},
	getData: function(nm, msg) {
		nm = nm || 0;
		Galer._curPage = nm;

		var profile = User.profile || {},
			opt = {
				options: {
					type: 'json'
				},
				params: {
					cmd: 'gal',
					usr: User.urlParams.par.usr || User.par.usr || profile.usr || window.gender || User.myLocale.usr || 'w',
					page: User.par.page || '',
					f: nm * 8,
					byAge: User.urlParams.par.byAge || 0
				}
			};
		if (User.urlParams.par.onum) {
			opt.params.onum = User.urlParams.par.onum;
		}
		if (User.urlParams.par.pass) {
			opt.params.pass = User.urlParams.par.pass;
		}
		if (User.urlParams.par.logout) {
			opt.params.logout = User.urlParams.par.logout;
		}
		if (User.needProfile) {
			opt.params.uAttr = 1;
		}

		if (User.urlParams.page === 'talk') {
			opt.params.page = 'talkn';
			opt.params.charset = 'windows-1251';
			if (msg) {
				opt.params.msg = msg;
			}
		} else if (User.urlParams.page === 'address') {
			opt.params.charset = 'windows-1251';
			opt.params.page = 'address';
		} else if (User.urlParams.page === 'meetme' || User.urlParams.page === 'wmeetme') {
			opt.params.meetme = User.urlParams.page;
			opt.params.meetmeNums = Galer.meetmeNums;
			if (Galer.rb_min_age) {
				var fullYear = new Date().getFullYear();
				opt.params.yy_t = fullYear - Galer.rb_min_age.value;
				opt.params.yy_f = fullYear - Galer.rb_max_age.value;
				if (msg) {
					opt.params.ns = msg;
				}
			}
		}

		if (User.urlParams.par.to || User.urlParams.par.ns) opt.params.to = User.urlParams.par.to || User.urlParams.par.ns;
		if (User.par.to) opt.params.to = User.par.to;
		return Util.requestJSONP(cgiURL, opt.params, {callbackParamName: 'callback'}).then(function(json) {
			if (json.res) {
				if (typeof(json.res) === 'string') {
					var txt = JSON.parse(json.res);
					json.res = txt;
				}
			}
			if (json.res.AUTH && json.res.AUTH.err) {
				User.needProfile = 1;
			}
			if (json.res.AUTH && User.needProfile) {
				User.auth = json.res.AUTH;
				if (json.res.notAnswer) {
					User.auth.notAnswer = json.res.notAnswer;
				}
				User._chkProfile();
			}
			if (json.res.galer) {
				User.galer = json.res.galer;
				Galer.chkGaler();
				//Util._toggleLogin(User.auth.err ? null : User.auth);
			}
			if (json.res.talk) {
				User.talk = json.res.talk;
				Talk.parse();
			}
			if (json.res.meetme) {
				Galer.meetme(json.res.meetme);
			}
		}).catch(console.error);
	},
	logout: function() {
		location.href = './register_id.html?logout=1'
	}
};

var Menu = {
	rbMenuButton: Util.getNode('rb-menu-button'),
	rbMenuContent: Util.getNode('rb-menu-content'),
	rbMenuManContent: Util.getNode('rb-menu-man-content'),
	toogle: function(it) {
		(Menu.rbMenuContent || Menu.rbMenuManContent).classList.toggle('collapse');
	},
	getMainMenu: function () {		// меню мужчин
		var cgi = '/cgi/';
		// var pref = host;
		// var pref = './brides';
		var pref = User.pref;
		if (User.urlParams.dir === 'services' ||
			User.urlParams.dir === 'scammers' ||
			User.urlParams.dir === 'flora'
		) { pref = '..'; }

		var data = {
			'home': {'url': pref + '/index.html', 'txt': 'Home' }
			,'about_us': {'url': pref + '/about_us.html', 'txt': 'About Us' }
			,'meetme': {'url': pref + '/meetme.html', 'txt': 'Invitation' }
			//,'community': {'url': pref + '/aulove.html', 'txt': 'Love Australia Community' }
			,'catalog': {'url': pref + '/wgaler.html', 'txt': 'Photo Catalogue' }
			,'women': {'url': pref + '/russian-women.html', 'txt': 'Russian women' }
			,'services': {'url': pref + '/services/index.html', 'txt': 'Service and Prices' }
			,'registration': {'url': pref + '/registration.html', 'txt': 'Join Now', 'class': 'mark' }
			,'login': {'url': pref + '/register_id.html', 'txt': 'Members Login', 'class': 'mark' }
			,'profile': {'url': pref + '/register_id.html', 'txt': 'Your Personal Profile', 'class': 'mark' }
			,'testimonies': {'url': pref + '/services/testimonies.html', 'txt': 'Clients Testimonies' }
			,'scammers': {'url': pref + '/scammers.html', 'txt': 'Beat Scammers' }
			,'anti-scam': {'url': pref + '/scammers/1.html', 'txt': 'Anti-scam' }
			,'flowers': {'url': pref + '/flora/floraLinks.html', 'txt': 'Send Flowers' }
			,'flightsHotels': {'url': pref + '/flora/FlightsHotels.html', 'txt': 'Flights and Hotels' }
			,'devushkam': {'url': pref + '/love/index.html', 'txt': 'Russian site >' }
			,'useful_links': {'url': pref + '/useful_links.html', 'txt': 'Useful Links' }
			,'aussie_videos': {'url': pref + '/aussie_videos.html', 'txt': 'Aussie Videos' }
			,'faq': {'url': pref + '/faq.html', 'txt': 'Faq' }
		};

		var prof = User.profile || {};
		var page = User.par.page || '';

		var onum = prof.onum || User.par.onum || '';
		var pass = prof.pass || User.par.pass || '';
		var usr = prof.usr|| User.par.usr || 'm';
		var op1 = prof.op1 || '';
		var dob = '';
		if(onum) {
            dob = 'usr=' + usr + '&onum=' + onum;
            if(pass > 0) {
                dob += '&pass=' + pass;
            }
            // if(s) {
                // dob += '&s=' + s;
            // }
            for(var key in data) {
				if (key !== 'devushkam') data[key]['url'] += '?' + dob;
			}
            // var url = cgi+'mserv.pl?cmd=gprf&act=chid&'+dob;
            var url = 'anketa.html?act=chid&'+dob;
            data.profile.url = url;
		}

		var out = '<table>';
		for(var key in data) {
			out += '<tr>';
			out += '<td><a href="' + data[key].url + '"';
			if (key == 'devushkam') out += ' target="_blank"';
			out += ' class="menu' + (page == key ?'_cur':'') + (data[key]['class'] ? ' ' + data[key]['class'] : '') + '"';
			out += '>' + data[key]['txt'] + '</a></td></tr>';
		}
		if(prof.pass || prof.s) {
			out += '<tr><td><a href="javascript:" onclick="RB.User.logout();" class="menu mark">Sign Out</a></td></tr>';
			var del = pref + (usr == 'w' ? '/love':'') + '/delete_id.html?cookie=1&'+dob;
			out += '<tr><td><br><br><a href="'+del+'" class="menu mark">Delete Profile</a></td></tr>';
		}
		out += '</table>';

		if(prof.notAnswer) {
			var st = '';
			for (var i in prof.notAnswer.arr) {
				var nm = prof.notAnswer.arr[i];
				st += 'ID: <a href="' +  pref + '/talk.html?to=' + nm + '&' + dob + '" target="_blank">' + nm + '</a><br>';
			}
			if(st) {
				out += '<table class="accAttr">';
				out += '<tr><td><br>Messages in rooms:</td></tr>';
				out += '<tr><td>' + st + '</td></tr>';
				out += '</table>';
			}
		}

		if(prof.accContain) {
			out += '<table class="accAttr">';
			out += '<tr><td>';
			var st = '<a href="/services/index.html"><b style="white-space: nowrap;">Your account contains:</b></a>';
			if(prof.accOk) {
				prof.accContainTitle = 'Premium Membership to date ' + prof.accContain;
				st += '<span class="anc"><br><br>Premium Membership to<br>date ' + prof.accContain;
				st += '<br>Profile Publish - <b>On</b> (<a href="/love/mgaler.html?v=' + prof.onum + '" target="_blank">LoveAustraliaRU</a>)</span>';
			} else {
				st += '<span class="anc"><br><br>Your Membership is: <b style="color: red">Off</b>';
				// if(onum) {
					prof.accContainTitle = 'Your Membership is: <b style="color: red">Off</b>';
				// }
			}
			out += st;
			out += '</td></tr>';
			out += '</table>';
			var node = Util.getNode('rb-item-accContainTitle');
			if (node) { node.innerHTML = prof.accContainTitle; }
		}
		return out;
	}
};
if (Menu.rbMenuButton) {
	Util.on(Menu.rbMenuButton, 'click', Menu.toogle);
}
if (Menu.rbMenuManContent) {
	Menu.rbMenuManContent.innerHTML = Menu.getMainMenu();
}

// if (User.cmdSave) {
	// Util.on(User.cmdSave, 'click', User.saveForm);
// }
Util.on(document.body, 'click', User.clickEvent);
User.getLocale();

var Galer = {
	galerTable: Util.getNode('rb-galer'),
	rbPhotoCatalog: Util.getNode('rb-photo-catalog'),
	rbItemDetail: Util.getNode('rb-item-detail'),
	meetme: function(meetme) {
		var it = meetme.ns;
		if (it) {
			if (!it.pdata.images) {
				User._prpItemImages(it);
			}
			Galer.meetmeNums.push(it.onum);
			it.pName = Util.getPname(it);
			it.age = new Date().getFullYear() - new Date(it.yy, it.pdata.mm - 1).getFullYear();
			it.gender = it.usr === 'm' ? 'Male' : 'Female';
			it.okrug = it.city + ', ' + it.country;
			User._chkProfileItems(it, Util.getNode('meetme_item'));

			Galer._putImageSrc(it, null, 1);
			Galer.next_warn.classList.add('collapse');
		} else {
			Galer.next_warn.classList.remove('collapse');
			Galer.next_warn.innerHTML = 'Sorry, not found this items!'
		}
	},
	meetmeNums: [],
	meetme_min_age: 18,
	meetme_max_age: 90,
	next_warn: Util.getNode('next_warn'),
	rb_min_age: Util.getNode('rb-min_age'),
	rb_max_age: Util.getNode('rb-max_age'),
	meetmeUpdate: function(cmd) {
		var lastOnum = Galer.meetmeNums[Galer.meetmeNums.length - 1];
		if (cmd === 'update' || cmd === 'no') {
			User.getData();
		} else if (cmd === 'profile') {
			Galer.showItem(lastOnum);
		} else if (cmd === 'yes') {
			User.getData(null, lastOnum);
		}
	},
	getNav: function() {
		var f = Number(User.galer.from),
			count = Number(User.galer.count.cnt),
			out = '';

		if (f > 0) { out = '<a href="javascript:" onclick="window.RB.Galer.gotoPrev();">&lt;...Previous</a>'; }
		var pn = 1 + Math.floor(f / 8),
			pall = Math.floor(count / 8),
			pos = count - 8;
		out += '&nbsp;&nbsp;&nbsp;[&nbsp;page ' + pn + '&nbsp;from <a href="javascript:" title="Go to last page" onclick="window.RB.Galer.gotoPos(0);">1</a>&nbsp; to ';
		out += ' <a href="javascript:" title="Go to last page" onclick="window.RB.Galer.gotoPos(' + (pall - 1) + ');">' + pall + '</a>&nbsp;]';
		if (pn < pall) { out += '&nbsp;&nbsp;&nbsp;<a href="javascript:" onclick="window.RB.Galer.gotoNext();">Next...&gt;</a>'; }
		return out;
	},
	chkGaler: function() {
		var arr = User.galer.arr || [],
			to = User.urlParams.par.to || '';
		//if (User.urlParams.par.to) opt.params.nw = User.urlParams.par.to;
		if (Galer.galerTable) {
			Galer.galerTable.innerHTML = Galer.getGalerTable(User.galer);
			var lists = Util.getNodes('rb-galer-nav');
			lists[0].innerHTML = lists[1].innerHTML = Galer.getNav();
			if (to) {
				if (arr[0]) { Galer._putItem(arr[0]); }
				Galer.rbPhotoCatalog.classList.add('collapse');
				Galer.rbItemDetail.classList.remove('collapse');
			} else {
				Galer.rbPhotoCatalog.classList.remove('collapse');
				Galer.rbItemDetail.classList.add('collapse');
			}
		} else if (Galer.onlineCont) {
			Galer.onlineCont.innerHTML = Galer.getGalerTable(User.galer, true);
		} else if (to && User.urlParams.page === 'address') {
			if (arr[0]) { Galer._putItem(arr[0]); }
		}
	},
	_currentItem: null,
	_putItem: function(it, node, form) {
		node = node || Galer.rbItemDetail;
		if (!it.pdata.images) {
			User._prpItemImages(it);
		}
		it.pName = Util.getPname(it);
		if (!it.bdate) {
			it.bdate = (it.pdata.dd || '01') + '/' + (it.pdata.mm || '12') + '/' + (it.pdata.yy || '1960');
		}
		it.age = new Date().getFullYear() - new Date(it.pdata.yy, it.pdata.mm - 1).getFullYear();
		var jpg2 = Galer._putImageSrc(it);
		if (jpg2) {
			 jpg2.title = 'View '+ it.pdata.images.length +' photos';
		}
		Galer._currentItem = it;
		Galer._putImageSrc(it, null, 1);
		Galer._putImageSrc(it, null, 3);
		Galer._putHref('/maps/myLocation.html?ip=' + it.ip, 'rb-href-url', node);

		var arr = Object.keys(it.pdata).concat(Object.keys(it));
		arr.forEach(function(key) {
			var list = Util.getNodes('rb-item-' + key, node),
				zn = it[key] || it.pdata[key];
			for (var i = 0, len = list.length; i < len; i++) {
				list[i].innerHTML = zn;
			}
			if(form && form[key]) {
				var trn = translates[key];
				var n = form[key],
					tagName = n.tagName.toLowerCase();
				if (trn) {
					if (it.usr === 'w') {
						if (trn.title) {
							n.parentNode.firstChild.textContent = trn.title;
						}
						if (trn.options) {
							n.options.length =  trn.options.length;
		
							for (var i = 0, len = trn.options.length; i < len; i++) {
								var pt = trn.options[i],
									opt = n.options[i];
								if (!opt) {
									opt = document.createElement("option");
									n.add(opt);
								}
								if (pt.value) opt.value = Util.trim(pt.value);
								if (pt.text) opt.text = Util.trim(pt.text);
								if (pt.selected === zn) {
									n.selectedIndex = i;
								}
							}
						}
					}
					if (trn.size) {
						n.style.width = trn.size + 'px';
					}
				}
				if(tagName === 'select') {
					for (var i = 0, len = n.options.length; i < len; i++) {
						var opt = n.options[i];
						if (opt.value === zn) {
							n.selectedIndex = i;
							break;
						}
					}
				} else if(tagName === 'input') {
					n.value = zn || '';
				}
				if(key === 'country') {
					// list[0].parentNode.firstChild.innerHTML = 'Russian level: ';
				}
			}
		});
		if(it.usr === 'm') {
			// if(key === 'state') {
				//L.DomUtil.addClass(, 'collapse')
				// 	list[0].parentNode.firstChild.innerHTML = 'Russian level: ';
			// }
			if(form && form.addru) {
				L.DomUtil.addClass(form.addru.parentNode, 'collapse')
			}
		} else {
			if(form && form.state) {
				L.DomUtil.addClass(form.state.parentNode, 'collapse')
			}
		}
		if (form) {
			//Util._prpItemImages(it);
			Galer._refreshImages(it.pdata.images);
		} else {
			Galer.activeItem = it;
			Galer.activeImage = 0;
			var list = Util.getNodes('cmdChangeImage', node),
				className = it.pdata.images.length > 1 ? 'removeClass' : 'addClass';
			for (var i = 0, len = list.length; i < len; i++) {
				L.DomUtil[className](list[i], 'collapse');
			}
		}
	},
	_curPage: 0,
	gotoCurPage: function() {
		var usr = User.auth.usr;
		location.href = '/' + (usr === 'w' ? 'love/m' : 'w') + 'galer.html?usr=' + usr + '&p=' + Galer._curPage;
	},
	gotoPos: function(nm) {
		if (nm !== undefined) Galer._curPage = nm;
		User.getData(Galer._curPage);
		// console.log('dddd', Galer._curPage);
		return false;
	},
	gotoPrev: function() {
		Galer._curPage--;
		User.getData(Galer._curPage);
		// console.log('dddd', Galer._curPage);
		return false;
	},
	gotoNext: function() {
		Galer._curPage++;
		User.getData(Galer._curPage);
		// console.log('gotoNext', Galer._curPage);
		return false;
	},
	resort: function(nm) {
		User.urlParams.par.byAge = nm;
		User.getData();
		return false;
	},
	showItem: function(onum) {
		var auth = window.RB.User.auth,
			usr = auth.usr,
			page = (usr === 'w' ? 'love/m' : 'w') + 'galer.html';

		location.href = '/' + page + '?to=' + onum + '&p=' + Galer._curPage;
	},
	itemRotate: function(img, deg, w, h) {
		// console.log(img, deg);

// var canvas = Util.createNode('canvas', {className: 'rb-view-image', attr:{dataKey: Galer._currentItemImage}}),

		var canvas = document.createElement('canvas'),
			w2 = img.naturalWidth / 2,
			h2 = img.naturalHeight / 2;

		w = w || 100;
		h = h || 150;
		canvas.width = w;
		canvas.height = h;
		var ctx = canvas.getContext('2d');
		ctx.translate(w / 2, h / 2); 
		ctx.rotate(deg * Math.PI / 180);
		ctx.drawImage(img, -w2, -h2);
		var parentNode = img.parentNode;
		parentNode.removeChild(img);
		parentNode.insertBefore(canvas, parentNode.firstChild);
	},
	onImageError: function(node) {
		var st = node.src || '';
		if (st.match('/0/')) {
			st = st.replace('/0/', '/1/');
		} else if (st.match('/1/')) {
			if (!st.match('/russianbrides\.com\.au/')) {
				st = host + (new URL(st)).pathname.replace('/1/', '/0/');
			} else {
				node.onerror = null;
				st = User.pref + '/jpeg/blank' + (st.match('/m/') ? 'm' : 'w') + '.jpg';
			}
		}
		node.src = st;
	},
	getGalerTable: function(online, flag) {
		var res = '<table>\n<tr>',
			arr = online.arr || [];
		for (var i = 0, len = arr.length; i < len; i++) {
			var it = arr[i],
				imagesCount = 0,
				_jpg1 = 'jpeg/' + it.usr + '/0/' + it.onum  + '_1a.jpg',
				rotate = ' onerror="window.RB.Galer.onImageError(this);"',
				// rotate = ' onerror="this.src = this.src.replace(\'/0/\', \'/1/\'); this.onerror = null;"',
				ev = 'window.RB.Galer.showItem(' + it.onum + ')';
			
			if (it.pdata) {
				var images = it.pdata.images || User._prpItemImages(it) || [];
				imagesCount = images.length;
				if (images[0]) {
					var img = images[0],
					_jpg1 = img.src;
					if (img.rotate) {
						rotate += ' onload="window.RB.Galer.itemRotate(this, ' + img.rotate + ')"';
					}
				}
			}
			res += '<td><a href="javascript:" onclick="' + ev + '">' +
				'<img src="' + User.pref + '/' + _jpg1 + '"' + rotate + ' />' +
				'<div class="rb-imagesCount" title="Photos">' + imagesCount + '</div>' +
				'<br><span>id: ' + it.onum + '</span>' +
				'<br><span>' + Util.getPname(it) + '</span>' +
				'</a></td>';	//  crossorigin="use-credentials"

			if (i === 3) {
				res += '</tr>\n';
				if (flag) { break; }
				res += '<tr>';
			} else if (i === 7) {
				res += '</tr>\n';
				break;
			}
		}
		return res + '</table>\n';
	},
	_putImageSrc: function(it, node, nm, name) {
		it = it || myAttr.profile;
		if (it && it.pdata) {
			node = node || Galer.rbItemDetail;
			nm = nm || 2;
			name = name || ('rb-src-jpg' + nm);
			var jpg = '_jpg' + nm,
				zn = it[jpg] || it.pdata[jpg] || it.pdata._jpg1,
				node1 = Util.getNode(name, node);

			if (it.pdata.images) {
				var pt = it.pdata.images[nm - 1];
				if (pt) {
					zn = pt.src;
					// if (node1) {node1.style.transform = 'rotate(' + pt.rotate + 'deg)';}
				}
			}
			if (node1) {node1.src = zn ? host + '/' + zn : './css/img/blank' + it.usr + '.jpg';}
			return node1;
		}
	},
	_putHref: function(zn, className, node) {
		node = node || Galer.rbItemDetail;

		var list = Util.getNodes(className, node);
		for (var i = 0, len = list.length; i < len; i++) {
			var node1 = list[i];
			if (className === 'rb-href-url') {
				node1.href = zn;
			} else if (className === 'rb-href-email') {
				node1.href = 'mailto:' + zn;
				node1.innerHTML = zn;
			}
		}
// console.log('_ _putImageSrc __', it);
	},
	_currentItemImage: null,
	_viewImagesDialog: function(ev) {
		var img = ev.target,
			tagName = img.tagName.toLowerCase(),
			images = Galer._currentItem.pdata.images;

		Galer._currentItemImage = 0;

		if (tagName === 'img') {
			var dialogNode = Util.getNode('dialog-pictures'),
				tmp = Util.templates.viewImage;
			tmp = tmp.replace('{buttons}', '').replace('{h_buttons}', '\
				<button type="button" class="ant-btn ant-btn-primary ant-btn-lg cmdPrev"><span>Prev</span></button>\
				<button type="button" class="ant-btn ant-btn-primary ant-btn-lg cmdNext"><span>Next</span></button>');

			//tmp = tmp.replace('{imgNum}', Galer._currentItemImage + 1);
			dialogNode.innerHTML = tmp;
	
			var footer = Util.getNode('ant-modal-footer', dialogNode);
			if (footer) { footer.innerHTML = '<span class="round rb-absolute">1</span'; }
			
			var body = Util.getNode('ant-modal-body'),
				dataKey = img.getAttribute('dataKey') || '';

			img = images[0];
			if (img) {
				body.innerHTML = '<img class="rb-view-image" src="'+ host + '/' + img.src +'" dataKey="'+ dataKey +'" />';
				dialogNode.classList.toggle('collapse');
				if (img.rotate) { User._setTransform(Util.getNode('rb-view-image', body), img.rotate); }
				// Util.getNode('rb-view-image', body).style.transform = 'rotate(' + pt.rotate + 'deg)';}
			}
		}
	}
};
Galer.onlineCont = Util.getNode('rb-online');
var vusr = window.gender === 'w' ? 'm' : 'w';
var it = window[vusr + 'Online'];
if (Galer.onlineCont && it) {
	// Galer.onlineCont.innerHTML = Galer.getGalerTable(it.online, true);
}
Galer.dialogPictures = Util.getNode('dialog-pictures');
if (Galer.dialogPictures) {
	Util.on(Galer.dialogPictures, 'click', User._dialogClick);
}

var Talk = {
	talkMessTable: Util.getNode('rb-talk'),
	talkRoom: function(usr, to) {
		location.href = '/talk.html?usr=' + usr + '&to=' + to;
// console.log('_ talkRoom __', usr);
	},
	chkMess: function() {
		User.clickEvent({
			target: Util.getNode('cmdTalk', Util.getNode('rb-talk-form-cont'))
		}, true);
	},
	parse: function() {
		var profile = User.profile,
			usr = profile.usr,
			pt = User.galer.arr[0],
			slinkTo = '<a href="./' + (usr === 'w' ? 'love/m' : 'w') + 'galer.html?usr=' + usr + '&to=' + pt.onum + '">',
			nav = '<tr class="rb-talk-nav"><td>' + slinkTo + '<b>Back to profile</b></a></td></tr>';

		pt.pName = Util.getPname(pt);

		var arr = User.talk.arr.map(function(it, i) {
			var dt = Util.uTimeToDate(it.pTime)
				ch = 1,
				pName = pt.pName;
			if (it.f === profile.onum && it.usr === profile.usr) {
				ch = 2;
				pName = profile.pName;
			}

			return '<tr class="tr' + ch + '"><td><b class="rb-date">' + dt + ' - ' + pName + '</b> : <span class="subject">' +
				decodeURIComponent(it.subj) + '</span><p>' +
				decodeURIComponent(it.txt) + '</p></td></tr>'
		});
		Talk.talkMessTable.innerHTML = nav + arr.join('\n') + (arr.length ? nav : '');
		var td = Util.getNode('rb-item-jpg1'),
			img = profile.pdata.images[0].src;
		td.innerHTML = '<img src="' + host + '/' + img + '" class="rb-img"><br><b>You</b>';

		td = Util.getNode('rb-pitem-jpg1');
		img = pt.pdata.images ? pt.pdata.images[0].src : pt.pdata._jpg1;
		td.innerHTML = '<img src="' + host + '/' + img + '" class="rb-img"><br><b>' + pt.pName + '</b>';

		td = Util.getNode('rb-pitem-href');
		td.innerHTML = 'Private Talk Room with ' + slinkTo + pt.pName + '</a>';
	}
};
if (Talk.talkMessTable && !Talk._setIntervalID) {
	Talk._setIntervalID = setInterval(Talk.chkMess.bind(this), 30000);
}

window.RB = {
	User: User,
	Menu: Menu,
	Galer: Galer,
	Talk: Talk,
	Util: Util
};

User.getData(User.urlParams.par.p || 0);
User.curYear = Util.getNode('curYear');
if (User.curYear) {
	User.curYear.innerHTML = '-' + (new Date()).getFullYear();
}
User.clockNode = Util.getNode('clockNode');
if (User.clockNode) {
	var lists = Util.getNodes('clock', User.clockNode);
	setInterval(function() {
		var dt = new Date();
		for(var i = 0, len = lists.length; i < len; i++) {
			var node = lists[i],
				opt;
			if (node.classList.contains('sdn')) {
				opt = {timeZone: 'Australia/Sydney'};
			} else if (node.classList.contains('msw')) {
				opt = {timeZone: 'Europe/Moscow'};
			}
			node.innerHTML = dt.toLocaleTimeString('ru-RU', opt);
		}
	}, 1000);
}

})();
