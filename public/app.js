        // Click listener for login submission, complete with error handler and page redirection
        $('#login').click(function() {
            $.post('/api/login', {
                username: $('#username').val(),
                password: $('#password').val()
            }, function(res) {
                if (res === "error") {
                    $('#login-error').text('Error: Username or password incorrect or you need to register first');
                } else {
                    $('#username').val('');
                    $("#password").val('');
                    window.location.href = "chat.html";
                } 
            });
        });

        // Click listener for registration submission, complete with error handler and further directions
         $('#register').click(function() {
            $.post('/api/register', {
                username: $('#username').val(),
                password: $('#password').val()
            }, function(res) {
                if (res === "exists") {
                    $('#login-error').text('Error: the username ' + $('#username').val() + ' already exist.');
                } else {
                    $('#login-error').text('Registered! Try logging in...');
                } 
            });
        });