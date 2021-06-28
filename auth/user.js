const crypto = require('crypto');
const jwt = require('jsonwebtoken');

exports.modules = {
	setPassword: function(password, user){
		user.salt = crypto.randomBytes(16).toString('hex');
		user.hash = crypto.pbkdf2Sync(password, user.salt, 1000, 64, 'sha512').toString('hex');
		return user;
	},
	validPassword: function(password, user) {
		const hash = crypto.pbkdf2Sync(password, user.salt, 1000, 64, 'sha512').toString('hex');
		return user.hash === hash;
	},
	generateJWT: function(user) {
		// set expiration to 60 days
		const today = new Date();
		const exp = new Date(today);
		exp.setDate(today.getDate() + 60);
	
		return jwt.sign({
			_id: user.user_id,
			username: user.username,
			exp: parseInt(exp.getTime() / 1000),
		}, process.env.SECRET);
	}
}