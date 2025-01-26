// src/utils/validationUtils.js
const validator = require('validator');

const validationUtils = {
    // Validate email
    validateEmail: (email) => {
        if (!email) {
            return { 
                isValid: false, 
                error: 'Email is required' 
            };
        }
        
        if (!validator.isEmail(email)) {
            return { 
                isValid: false, 
                error: 'Invalid email format' 
            };
        }
        
        return { 
            isValid: true 
        };
    },

    // Validate password
    validatePassword: (password) => {
        if (!password) {
            return { 
                isValid: false, 
                error: 'Password is required' 
            };
        }
        
        if (password.length < 8) {
            return { 
                isValid: false, 
                error: 'Password must be at least 8 characters long' 
            };
        }
        
        // Check for at least one uppercase, one lowercase, one number
        if (!/(?=.*\d)(?=.*[a-z])(?=.*[A-Z])/.test(password)) {
            return { 
                isValid: false, 
                error: 'Password must contain at least one uppercase letter, one lowercase letter, and one number' 
            };
        }
        
        return { 
            isValid: true 
        };
    },

    // Validate username
    validateUsername: (username) => {
        if (!username) {
            return { 
                isValid: false, 
                error: 'Username is required' 
            };
        }
        
        if (username.length < 3 || username.length > 20) {
            return { 
                isValid: false, 
                error: 'Username must be between 3 and 20 characters' 
            };
        }
        
        // Alphanumeric username check
        if (!/^[a-zA-Z0-9_]+$/.test(username)) {
            return { 
                isValid: false, 
                error: 'Username can only contain letters, numbers, and underscores' 
            };
        }
        
        return { 
            isValid: true 
        };
    }
};

module.exports = validationUtils;
