// Load the Mongoose module and Schema object
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const crypto = require('crypto');

// Define a new 'UserSchema'
const UserSchema = new Schema({
    firstName: String,
    lastName: String,
    email: {
        type: String,
        index: true,
        match: [/.+\@.+\..+/, "Please use valid e-mail address"]
    },
    username: {
        type: String,
        trim: true,
        required: true,
        unique: true
    },
    password: {
        type: String,
        // Validate the 'password' value length
        validate: [
            (password) => password && password.length > 6,
            'Password should be longer'
        ]
    },
    salt: {
       type: String
    },
    provider: {
        type: String,
        required: 'Provider is required'
    },
    providerId: String,
    providerData: {},
    created: {
        type: Date,
        default: Date.now
    },
    website: {
        type: String,
        set: function(url) {
            if (!url) {
                return url;
            } else {
                if (url.indexOf('http://') !== 0 && url.indexOf('https://') !== 0) {
                    url = 'http://' + url;
                }
                return url;
            }
        },
        get: function(url) {
            if (!url) {
                return url;
            } else {
                if (url.indexOf('http://') !== 0 && url.indexOf('https://') !== 0) {
                    url = 'http://' + url;
                }
                return url;
            }
        }
    },
    role: {
        type: String,
        // Validate the 'role' value using enum list
        enum: ['Admin', 'Owner', 'User']
    },
});

// Set the 'fullname' virtual property
UserSchema.virtual('fullName').get(function() {
    return this.firstName + ' ' + this.lastName;
}).set(function(fullName) {
    let splitName = fullName.split(' ');
    this.firstName = splitName[0] || '';
    this.lastName = splitName[1] || '';
});

// Configure the 'UserSchema' to use getters and virtuals when transforming to JSON
UserSchema.set('toJSON', {
    getters: true,
    virtuals: true
});



// Create the 'findOneByUsername' static method
UserSchema.statics.findOneByUsername = function(username, callback) {
    // Use the 'findOne' method to retrieve a user document
    this.findOne({
        username: new RegExp(username, 'i')
    }, callback);
};


// AUTHENTICATION

// Use a pre-save middleware to hash the password
UserSchema.pre('save', function(next) {
    if (this.password) {
        this.salt = new Buffer(crypto.randomBytes(16).toString('base64'), 'base64');
        this.password = this.hashPassword(this.password);
    }

    next();
});

// Create an instance method for hashing a password
UserSchema.methods.hashPassword = function(password) {
    return crypto.pbkdf2Sync(password, this.salt, 10000, 64, 'sha512').toString('base64');
};

// Create an instance method for authenticating user
UserSchema.methods.authenticate = function(password) {
    return this.password === this.hashPassword(password);
};

UserChema.methods.isAdmin= function() {
    return this.role === 'Admin';
};

// Find possible not used username
UserSchema.statics.findUniqueUsername = function(username, suffix, callback) {
    // Add a 'username' suffix
    const possibleUsername = username + (suffix || '');

    // Use the 'User' model 'findOne' method to find an available unique username
    this.findOne({
        username: possibleUsername
    }, (err, user) => {
        // If an error occurs call the callback with a null value, otherwise find find an available unique username
        if (!err) {
            // If an available unique username was found call the callback method,
            // otherwise call the 'findUniqueUsername' method again with a new suffix
            if (!user) {
                callback(possibleUsername);
            } else {
                return this.findUniqueUsername(username, (suffix || 0) + 1, callback);
            }
        } else {
            callback(null);
        }
    });
};


// Create the 'User' model out of the 'UserSchema'
mongoose.model('User', UserSchema);