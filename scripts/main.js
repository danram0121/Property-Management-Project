var webSqlApp = webSqlApp || {};
webSqlApp = {

//______Session______
    setSession: function (name, fullName, userType) {
      var db = this.openDb('2.0');
      db.transaction(function (t) {
        t.executeSql('INSERT INTO sessionUser(username, userFullName, userType) VALUES(?, ?, ?)',
            [name, fullName, userType],
            function (transaction, results) {
                console.log('Logged In');
            });
      }, this.onError, this.onSuccess("No Error"));
    },

//______Database______

    version: '0.0',

    onError: function (err) {
        console.log('Error Code:', err.code, 'Message: ', err.message);
    },

    onSuccess: function (success) {
        console.log(success);
    },

    openDb: function (ver) {
        var db = openDatabase('HCItemRecords', ver, 'Happy Citizens Item Records', 5 * 1024 * 1024);
        this.version = ver;
        return db;
    },

    addTable: function () {
        if (this.version === '1.0') {
            var db = this.openDb('1.0');

            db.changeVersion('1.0', '2.0', createTables, this.onError, this.onSuccess('Tables added'));
            return db;
        } else {
            console.log('Table already exists');
        }

        function createTables(transaction) {
            transaction.executeSql("CREATE TABLE IF NOT EXISTS login(" +
                "username VARCHAR(50) PRIMARY KEY, " +
                "password VARCHAR(50))"
            );
            transaction.executeSql("CREATE TABLE IF NOT EXISTS userInfo(" +
                "username VARCHAR(50) PRIMARY KEY, " +
                "firstName VARCHAR(50), " +
                "lastName VARCHAR(50), " +
                "userType VARCHAR(50))"
            );
            transaction.executeSql("CREATE TABLE IF NOT EXISTS sessionUser(" +
                "username VARCHAR(50) PRIMARY KEY, " +
                "userFullName VARCHAR(50), " +
                "userType VARCHAR(50))"
            );
            transaction.executeSql("CREATE TABLE IF NOT EXISTS property(" +
                "id INTEGER PRIMARY KEY AUTOINCREMENT, " +
                "username VARCHAR(50), " +
                "propertyName VARCHAR(50))"
            );
            transaction.executeSql("CREATE TABLE IF NOT EXISTS shareAccess(" +
                "username VARCHAR(50) PRIMARY KEY, " +
                "sharedUser VARCHAR(50))"
            );
            transaction.executeSql("CREATE TABLE IF NOT EXISTS propertyShared(" +
                "id INTEGER PRIMARY KEY, " +
                "username VARCHAR(50), " +
                "sharedUser VARCHAR(50))"
            );
            transaction.executeSql("CREATE TABLE IF NOT EXISTS submitRequest(" +
                "id INTEGER PRIMARY KEY, " +
                "username VARCHAR(50), " +
                "propertyName VARCHAR(50), " +
                "status VARCHAR(50))"
            );
        }


    },

    register: function (username, password, con_password, firstName, lastName, userType) {
        var db = this.openDb('2.0');
        db.transaction(function (t) {
            t.executeSql('SELECT * FROM login WHERE username = ?',
                [username],
                function (transaction, results) {
                    if(results.rows.length == 0){
                      if(password.localeCompare(con_password)!=0){
                        alert("Passwords do not Match");
                        return;
                      }
                      else{
                        t.executeSql('INSERT INTO login(username, password) VALUES(?, ?)',
                            [username, password],
                            function (transaction, results) {
                            });
                        t.executeSql('INSERT INTO userInfo(username, firstName, lastName, userType) VALUES(?, ?, ?, ?)',
                            [username, firstName, lastName, userType],
                            function (transaction, results) {
                            });
                        window.location.replace("../common/login.html");
                      }
                    }
                    else if (userType.localeCompare('ADMIN') == 0){
                    }
                    else{
                      alert("Account with that Email Already Exists");
                    }
                });
        }, this.onError, this.onSuccess("No Error"));
    },

    login: function (username, password) {
        var sessName;
        var sessFullName;
        var db = this.openDb('2.0');
        db.transaction(function (t) {
            t.executeSql('SELECT * FROM login WHERE username = ?',
                [username],
                function (transaction, results) {
                    if(results.rows.length == 0){
                      alert("Email or Password is Incorrect");
                    }
                    else if(results.rows.item(0).password.localeCompare(password) == 0){
                      t.executeSql('SELECT * FROM userInfo WHERE username = ?',
                          [username],
                          function (transaction, results) {
                            sessName = results.rows.item(0).username;
                            sessFullName = results.rows.item(0).firstName + " " + results.rows.item(0).lastName;
                            sessUserType = results.rows.item(0).userType;
                            webSqlApp.setSession(sessName, sessFullName, sessUserType);
                            setTimeout(() => { window.location.replace("../common/dashboard.html"); }, 1000);
                      });
                    }
                    else{
                      alert("Email or Password is Incorrect");
                    }
                });
        }, this.onError, this.onSuccess("No Error"));
    },

    logout: function(){
      var db = this.openDb('2.0');
      db.transaction(function (t) {
        t.executeSql('DELETE FROM sessionUser', []);
      }, this.onError, this.onSuccess("No Error"));
    },

    viewProperty: function(){
      var username;
      var db = this.openDb('2.0');
      db.transaction(function (t) {
        t.executeSql('SELECT * FROM sessionUser',
            [],
            function (transaction, results) {
              if(results.rows.item(0).userType.localeCompare('ADMIN') == 0){
                t.executeSql('SELECT * FROM property',
                    [],
                    function (transaction, results) {
                        if(results.rows.length == 0){
                          document.getElementById('propertyList').innerHTML = "";
                          alert("No Properties Saved");
                        }
                        else{
                          document.getElementById('propertyList').innerHTML = "";

                          for (let i = 0; i < results.rows.length; i++) {
                            document.getElementById('propertyList').innerHTML +=
                            "<b>Property ID: </b>" +
                            results.rows.item(i).id +
                            "<b> Property Owner: </b>" +
                            results.rows.item(i).username +
                            "<b> Property Name: </b>" +
                            results.rows.item(i).propertyName +
                            "\n<br>";
                          }
                        }
                    });
              }
              else{
                username = results.rows.item(0).username;
                t.executeSql('SELECT * FROM property WHERE username = ?',
                    [username],
                    function (transaction, results) {
                        if(results.rows.length == 0){
                          document.getElementById('propertyList').innerHTML = "";
                          alert("You have no Properties Saved");
                        }
                        else{
                          document.getElementById('propertyList').innerHTML = "";

                          for (let i = 0; i < results.rows.length; i++) {
                            document.getElementById('propertyList').innerHTML +=
                            "<b>Property ID: </b>" +
                            results.rows.item(i).id +
                            "<b> Property Name: </b>" +
                            results.rows.item(i).propertyName +
                            "\n<br>";
                          }
                        }
                    });
                }
              });
      }, this.onError, this.onSuccess("No Error"));
    },

    viewSharedProperty: function(){
      var username;
      var db = this.openDb('2.0');
      db.transaction(function (t) {
        t.executeSql('SELECT * FROM sessionUser',
            [],
            function (transaction, results) {
              if(results.rows.item(0).userType.localeCompare('ADMIN') == 0){
                t.executeSql('SELECT * FROM propertyShared',
                    [],
                    function (transaction, results) {
                        if(results.rows.length == 0){
                          document.getElementById('sharedPropertyList').innerHTML = "";
                          alert("No Properties Shared");
                        }
                        else{
                          document.getElementById('sharedPropertyList').innerHTML = "";

                          for (let i = 0; i < results.rows.length; i++) {
                            document.getElementById('sharedPropertyList').innerHTML +=
                            "<b>User </b>" +
                            results.rows.item(i).username +
                            "<b> is Sharing Property ID: </b>" +
                            results.rows.item(i).id +
                            "<b> With </b>" +
                            results.rows.item(i).sharedUser +
                            "\n<br>";
                          }
                        }
                    });
              }
              else{
                username = results.rows.item(0).username;
                t.executeSql('SELECT * FROM propertyShared WHERE username = ?',
                    [username],
                    function (transaction, results) {
                        if(results.rows.length == 0){
                          alert("You are not Sharing Any Properties");
                          document.getElementById('sharedPropertyList').innerHTML = "";
                        }
                        else{
                          document.getElementById('sharedPropertyList').innerHTML = "";
                          for (let i = 0; i < results.rows.length; i++) {
                            document.getElementById('sharedPropertyList').innerHTML +=
                            "<b>You are Sharing Property ID: </b>" +
                            results.rows.item(i).id +
                            "<b> With </b>" +
                            results.rows.item(i).sharedUser +
                            "<br>";
                          }
                        }
                    });
                  }
                });
      }, this.onError, this.onSuccess("No Error"));
    },

    viewPropertySharedWith: function(){
      var username;
      var db = this.openDb('2.0');
      db.transaction(function (t) {
        t.executeSql('SELECT * FROM sessionUser',
            [],
            function (transaction, results) {
              username = results.rows.item(0).username;
              t.executeSql('SELECT * FROM propertyShared WHERE sharedUser = ?',
                  [username],
                  function (transaction, results) {
                      if(results.rows.length == 0){
                        document.getElementById('propertySharedWithList').innerHTML = "";
                        alert("No Properties Shared With You");
                      }
                      else{
                        document.getElementById('propertySharedWithList').innerHTML = "";
                        for (let i = 0; i < results.rows.length; i++) {
                          document.getElementById('propertySharedWithList').innerHTML +=
                          "<b>User </b>" +
                          results.rows.item(i).username +
                          "<b> is Sharing Property ID: </b>" +
                          results.rows.item(i).id +
                          "<b> with You</b>" +
                          "\n<br>";
                        }
                      }
                  });
              });
      }, this.onError, this.onSuccess("No Error"));
    },

    viewShareAccess: function(){
      var username;
      var db = this.openDb('2.0');
      db.transaction(function (t) {
        t.executeSql('SELECT * FROM sessionUser',
            [],
            function (transaction, results) {
              if(results.rows.item(0).userType.localeCompare('ADMIN') == 0){
                t.executeSql('SELECT * FROM shareAccess',
                    [],
                    function (transaction, results) {
                        if(results.rows.length == 0){
                          document.getElementById('shareAccessList').innerHTML = "";
                          alert("No Accounts are Sharing Access");
                        }
                        else{
                          document.getElementById('shareAccessList').innerHTML = "";
                          for (let i = 0; i < results.rows.length; i++) {
                            document.getElementById('shareAccessList').innerHTML +=
                            "<b>User </b>" +
                            results.rows.item(i).username +
                            "<b> is Sharing Account Access with </b>" +
                            results.rows.item(i).sharedUser +
                            "\n<br>";
                          }
                        }
                    });
              }
              else{
                t.executeSql('SELECT * FROM shareAccess',
                    [],
                    function (transaction, results) {
                        if(results.rows.length == 0){
                          document.getElementById('shareAccessList').innerHTML = "";
                          alert("You are not Sharing Account Access");
                        }
                        else{
                          document.getElementById('shareAccessList').innerHTML = "";
                          for (let i = 0; i < results.rows.length; i++) {
                            document.getElementById('shareAccessList').innerHTML +=
                            results.rows.item(i).sharedUser +
                            "\n<br>";
                          }
                        }
                    });
              }
            });
      }, this.onError, this.onSuccess("No Error"));
    },

    addProperty: function(propertyName){
      var username;
      var db = this.openDb('2.0');
      db.transaction(function (t) {
        t.executeSql('SELECT * FROM sessionUser',
            [],
            function (transaction, results) {
              username = results.rows.item(0).username;
              t.executeSql('INSERT INTO property(username, propertyName) VALUES(?, ?)',
                  [username, propertyName],
                  function (transaction, results) {
                    console.log('Inserted Id:', results.insertId);
                });
              });
      }, this.onError, this.onSuccess("No Error"));
      alert("Property Successfully Added");
    },

    updateProperty: function(newPropertyName, propertyID){
      if(propertyID.localeCompare(null) == 0){
        alert("Enter a Property ID");
      }
      var db = this.openDb('2.0');
      db.transaction(function (t) {
        t.executeSql('SELECT * FROM sessionUser',
            [],
            function (transaction, results) {
              if(results.rows.item(0).userType.localeCompare('ADMIN') == 0){
                t.executeSql('SELECT * FROM property WHERE id = ?',
                    [propertyID],
                    function (transaction, results) {
                      if(results.rows.length == 0){
                        alert("Property With ID Does Not Exist");
                      }
                      else{
                        t.executeSql('UPDATE property SET propertyName = ? WHERE id = ?',
                            [newPropertyName, propertyID]);
                        alert("Property Successfully Updated");
                      }
                    });
              }
              else{
                username = results.rows.item(0).username;
                t.executeSql('SELECT * FROM property WHERE username = ? AND id = ?',
                    [username, propertyID],
                    function (transaction, results) {
                      if(results.rows.length == 0){
                        alert("You Do Not Own This Property");
                      }
                      else{
                        t.executeSql('UPDATE property SET propertyName = ? WHERE id = ?',
                            [newPropertyName, propertyID]);
                        alert("Property Successfully Updated");
                      }
                    });
                }
                });
      }, this.onError, this.onSuccess('No Error'));
    },

    deleteProperty: function(propertyID){
      var db = this.openDb('2.0');
      db.transaction(function (t) {
        t.executeSql('SELECT * FROM sessionUser',
            [],
            function (transaction, results) {
              if(results.rows.item(0).userType.localeCompare('ADMIN') == 0){
                t.executeSql('SELECT * FROM property WHERE id = ?',
                    [propertyID],
                    function (transaction, results) {
                      if(results.rows.length == 0){
                        alert("Property does not Exist");
                      }
                      else{
                        t.executeSql('DELETE FROM property WHERE id = ?',
                            [propertyID]);
                        alert("Property Successfully Deleted");
                      }
                    });
              }
              else{
              username = results.rows.item(0).username;
              t.executeSql('SELECT * FROM property WHERE username = ? AND id = ?',
                  [username, propertyID],
                  function (transaction, results) {
                    if(results.rows.length == 0){
                      alert("You Do Not Own This Property");
                    }
                    else{
                      t.executeSql('DELETE FROM property WHERE username = ? AND id = ?',
                          [username, propertyID]);
                      alert("Property Successfully Deleted");
                    }
                  });
              }
            });
      }, this.onError, this.onSuccess('NoError'));
      db.transaction(function (t) {
        t.executeSql('SELECT * FROM sessionUser',
            [],
            function (transaction, results) {
              if(results.rows.item(0).userType.localeCompare('ADMIN') == 0){
                t.executeSql('SELECT * FROM property WHERE id = ?',
                    [propertyID],
                    function (transaction, results) {
                      if(results.rows.length == 0){
                        alert("Property does not Exist");
                      }
                      else{
                        t.executeSql('DELETE FROM property WHERE id = ?',
                            [propertyID]);
                        alert("Property Successfully Deleted");
                      }
                    });
              }
              else{
                username = results.rows.item(0).username;
                t.executeSql('SELECT * FROM propertyShared WHERE username = ? AND id = ?',
                    [username, propertyID],
                    function (transaction, results) {
                      if(results.rows.length == 0){
                        alert("Property Not Shared");
                      }
                      else{
                        t.executeSql('DELETE FROM propertyShared WHERE username = ? AND id = ?',
                            [username, propertyID]);
                        alert("Shared Property Successfully Deleted");
                      }
                    });
                  }
                });
      }, this.onError, this.onSuccess('NoError'));
    },

    shareAccess: function(sharedUser){
      var username;
      var db = this.openDb('2.0');
      db.transaction(function (t) {
        t.executeSql('SELECT * FROM sessionUser',
            [],
            function (transaction, results) {
              username = results.rows.item(0).username;
              t.executeSql('SELECT * FROM userInfo WHERE username = ?',
                  [sharedUser],
                  function (transaction, results) {
                    if(results.rows.length == 0){
                      alert("User does not Exist");
                    }
                    else{
                      t.executeSql('INSERT INTO shareAccess(username, sharedUser) VALUES(?, ?)',
                          [username, sharedUser],
                          function (transaction, results) {
                        });
                        alert("Sharing Account Access with New User");
                    }
                  });
            });
      }, this.onError, this.onSuccess("No Error"));
    },

    removeAccess: function(sharedUser){
      var username;
      var db = this.openDb('2.0');
      db.transaction(function (t) {
        t.executeSql('SELECT * FROM sessionUser',
            [],
            function (transaction, results) {
              username = results.rows.item(0).username;
              t.executeSql('SELECT * FROM shareAccess WHERE username = ? AND sharedUser = ?',
                  [username, sharedUser],
                  function (transaction, results) {
                    if(results.rows.length == 0){
                      alert("You are not Sharing Account Access with User");
                    }
                    else{
                      t.executeSql('DELETE FROM shareAccess WHERE username = ? AND sharedUser = ?', [username, sharedUser]);
                      t.executeSql('DELETE FROM propertyShared WHERE username = ? AND sharedUser = ?', [username, sharedUser]);
                      alert("Shared Access Removed and All Shared Property Removed");
                    }
                  });
            });
      }, this.onError, this.onSuccess("No Error"));
    },

    shareProperty: function(propertyID, sharedUser){
      var username;
      var db = this.openDb('2.0');
      db.transaction(function (t) {
        t.executeSql('SELECT * FROM sessionUser',
            [],
            function (transaction, results) {
              username = results.rows.item(0).username;
              t.executeSql('SELECT * FROM property WHERE id = ? AND username = ?',
                  [propertyID, username],
                  function (transaction, results) {
                    if(results.rows.length == 0){
                      alert("You do not Own this Property");
                    }
                    else{
                      t.executeSql('SELECT * FROM shareAccess WHERE username = ? and sharedUser = ?',
                          [username, sharedUser],
                          function (transaction, results) {
                            if(results.rows.length == 0){
                              alert("You are not Sharing Account Access with User");
                            }
                            else{
                              t.executeSql('INSERT INTO propertyShared(id, username, sharedUser) VALUES(?, ?, ?)',
                                  [propertyID, username, sharedUser],
                                  function (transaction, results) {
                                      console.log('Inserted Id:', results.insertId);
                                });
                                alert("Property Successfully Shared");
                            }
                          });
                    }
                  });
            });
      }, this.onError, this.onSuccess("No Error"));
    },

    updateSharedProperty: function(newPropertyName, propertyID){
      var db = this.openDb('2.0');
      db.transaction(function (t) {
        t.executeSql('SELECT * FROM sessionUser',
            [],
            function (transaction, results) {
              username = results.rows.item(0).username;
              t.executeSql('SELECT * FROM propertyShared WHERE id = ? AND sharedUser = ?',
                  [propertyID, username],
                  function (transaction, results) {
                    if(results.rows.length == 0){
                      alert("This Property is not Shared with You");
                    }
                    else{
                      t.executeSql('UPDATE property SET propertyName = ? WHERE id = ?',
                          [newPropertyName, propertyID]);
                      alert("Shared Property Successfully Updated");
                    }
                  });
            });
      }, this.onError, this.onSuccess('No Error'));
    },

    deleteSharedProperty: function(propertyID){
      var db = this.openDb('2.0');
      db.transaction(function (t) {
        t.executeSql('SELECT * FROM sessionUser',
            [],
            function (transaction, results) {
              username = results.rows.item(0).username;
              t.executeSql('SELECT * FROM propertyShared WHERE id = ? AND sharedUser = ?',
                  [propertyID, username],
                  function (transaction, results) {
                    if(results.rows.length == 0){
                      alert("This Property is not Shared with You");
                    }
                    else{
                      t.executeSql('DELETE FROM propertyShared WHERE id = ?', [propertyID]);
                      t.executeSql('DELETE FROM property WHERE id = ?', [propertyID]);
                      alert("Shared Property Successfully Deleted");
                    }
                  });
            });
      }, this.onError, this.onSuccess('NoError'));
    },

    changePassword: function(currentPassword, password, con_password){
      var db = this.openDb('2.0');
      db.transaction(function (t) {
        t.executeSql('SELECT * FROM sessionUser',
            [],
            function (transaction, results) {
              username = results.rows.item(0).username;
              t.executeSql('SELECT * FROM login WHERE username = ?',
                  [username],
                  function (transaction, results) {
                    if(currentPassword.localeCompare(results.rows.item(0).password) == 0){
                      if(password.localeCompare(con_password) != 0){
                        alert("Passwords do not Match");
                      }
                      else{
                        t.executeSql('UPDATE login SET password = ? WHERE username = ?',
                            [password, username]);
                        alert("Password Successfully Updated");
                      }
                    }
                    else{
                      alert("Wrong Password");
                    }
                  });
            });
      }, this.onError, this.onSuccess('NoError'));
    },

    submitRequest: function(propertyID){
      var db = this.openDb('2.0');
      db.transaction(function (t) {
        t.executeSql('SELECT * FROM sessionUser',
            [],
            function (transaction, results) {
              username = results.rows.item(0).username;
              t.executeSql('SELECT * FROM property WHERE id = ? AND username =?',
                  [propertyID, username],
                  function (transaction, results) {
                    if(results.rows.length == 0){
                      alert("You do not Own this Property");
                    }
                    else{
                      propertyName = results.rows.item(0).propertyName;
                      status = "Pending";
                      t.executeSql('INSERT INTO submitRequest(id, username, propertyName, status) VALUES(?, ?, ?, ?)',
                          [propertyID, username, propertyName, status],
                          function (transaction, results) {
                        });
                      alert("Request Submitted");
                    }
                  });
            });
      }, this.onError, this.onSuccess('NoError'));
    },

    viewRequests: function(){
      var db = this.openDb('2.0');
      db.transaction(function (t) {
        t.executeSql('SELECT * FROM sessionUser',
            [],
            function (transaction, results) {
              if(results.rows.item(0).userType.localeCompare('ADMIN') == 0){
                t.executeSql('SELECT * FROM submitRequest',
                    [],
                    function (transaction, results) {
                      if(results.rows.length == 0){
                        document.getElementById('viewRequests').innerHTML = "";
                        alert("No Requests Submitted");
                      }
                      else{
                        document.getElementById('viewRequests').innerHTML = "";
                        for (let i = 0; i < results.rows.length; i++) {
                          document.getElementById('viewRequests').innerHTML +=
                          "<b>User </b>" +
                          results.rows.item(i).username +
                          "<b> Submitted Request for Property ID </b>" +
                          results.rows.item(i).id +
                          "<b> Called </b>" +
                          results.rows.item(i).propertyName +
                          "<b> Current Status: </b>" +
                          results.rows.item(i).status +
                          "\n<br>";
                      }
                    }
                  });
              }
              else{
                username = results.rows.item(0).username;
                t.executeSql('SELECT * FROM submitRequest WHERE username = ?',
                    [username],
                    function (transaction, results) {
                      if(results.rows.length == 0){
                        document.getElementById('viewRequests').innerHTML = "";
                        alert("No Requests Submitted");
                      }
                      else{
                        document.getElementById('viewRequests').innerHTML = "";
                        for (let i = 0; i < results.rows.length; i++) {
                          document.getElementById('viewRequests').innerHTML +=
                          "<b>You Submitted Request for Property ID </b>" +
                          results.rows.item(i).id +
                          "<b> Called </b>" +
                          results.rows.item(i).propertyName +
                          "<b> Current Status: </b>" +
                          results.rows.item(i).status +
                          "\n<br>";
                      }
                    }
                  });
              }
            });
      }, this.onError, this.onSuccess('NoError'));
    },

    acceptRequest: function(propertyID){
      var db = this.openDb('2.0');
      db.transaction(function (t) {
        t.executeSql('SELECT * FROM sessionUser',
            [],
            function (transaction, results) {
              if(results.rows.item(0).userType.localeCompare('ADMIN') == 0){
                t.executeSql('SELECT * FROM submitRequest',
                    [],
                    function (transaction, results) {
                      if(results.rows.length == 0){
                        alert("No Requests Submitted");
                      }
                      else{
                        status = "Accepted";
                        t.executeSql('UPDATE submitRequest SET status = ? WHERE id = ?',
                            [status, propertyID]);
                        alert("Request Accepted");
                      }
                    });
              }
              else{
                alert("You do not have Access to this Function");
              }
            });
      }, this.onError, this.onSuccess('NoError'));
    },

    writeFile: function(){
      var textFile = null,
        makeTextFile = function (text) {
          var data = new Blob([text], {type: 'text/plain'});

          // If we are replacing a previously generated file we need to
          // manually revoke the object URL to avoid memory leaks.
          if (textFile !== null) {
            window.URL.revokeObjectURL(textFile);
          }

          textFile = window.URL.createObjectURL(data);

          return textFile;
        };

        document.getElementById('textbox').value = document.getElementById('propertyList').textContent +
        document.getElementById('sharedPropertyList').textContent +
        document.getElementById('propertySharedWithList').textContent +
        document.getElementById('viewRequests').textContent;
        var create = document.getElementById('btnWriteFile'),
          textbox = document.getElementById('textbox');

        //create.addEventListener('click', function () {
          var link = document.getElementById('downloadlink');
          link.href = makeTextFile(textbox.value);
          link.style.display = 'block';
        //}, false);
      }
};

//Page Specific Features

function loginOnLoad() {
  webSqlApp.logout();
  document.getElementById('btnLogin').addEventListener('click', function () {
      var username = document.getElementById('username').value;
      var password = document.getElementById('password').value;
      webSqlApp.login(username, password);
  });
};

function registerOnLoad() {
  webSqlApp.logout();
  document.getElementById('btnRegister').addEventListener('click', function () {
      var username = document.getElementById('username').value;
      var password = document.getElementById('password').value;
      var con_password = document.getElementById('con_password').value;
      var firstName = document.getElementById('firstName').value;
      var lastName = document.getElementById('lastName').value;
      webSqlApp.register(username, password, con_password, firstName, lastName, 'USER');
  });
};

function dashboardOnLoad() {
  var db = webSqlApp.openDb('2.0');
  db.transaction(function (t) {
    t.executeSql('SELECT * FROM sessionUser',
        [],
        function (transaction, results) {
             document.getElementById('loginFullName').innerHTML = results.rows.item(0).userFullName;
             if(results.rows.item(0).userType.localeCompare('ADMIN') == 0){
               document.getElementById('addPropertyFields').style.display = "none";
               document.getElementById('shareFields').style.display = "none";
               document.getElementById('sharedWithFields').style.display = "none";
               document.getElementById('submitRequestField').style.display = "none";
             }
             else{
               document.getElementById('acceptRequestField').style.display = "none";
             }
        });
  }, webSqlApp.onError, webSqlApp.onSuccess("No Error"));
  document.getElementById('btnViewProperty').addEventListener('click', function () {
      webSqlApp.viewProperty();
  });
  document.getElementById('btnAddProperty').addEventListener('click', function () {
      var propertyName = document.getElementById('propertyName').value;
      webSqlApp.addProperty(propertyName);
  });
  document.getElementById('btnWriteFile').addEventListener('click', function () {
      webSqlApp.writeFile();
  });
  document.getElementById('btnUpdateProperty').addEventListener('click', function () {
      var updatePropertyID = document.getElementById('updatePropertyID').value;
      var updatePropertyName = document.getElementById('updatePropertyName').value;
      webSqlApp.updateProperty(updatePropertyName, updatePropertyID);
  });
  document.getElementById('btnDeleteProperty').addEventListener('click', function () {
      var deletePropertyID = document.getElementById('deletePropertyID').value;
      webSqlApp.deleteProperty(deletePropertyID);
  });
  document.getElementById('btnViewSharedProperty').addEventListener('click', function () {
      webSqlApp.viewSharedProperty();
  });
  document.getElementById('btnShareProperty').addEventListener('click', function () {
      var sharedPropertyID = document.getElementById('sharedPropertyID').value;
      var sharedPropertyUser = document.getElementById('sharedPropertyUser').value;
      webSqlApp.shareProperty(sharedPropertyID, sharedPropertyUser);
  });
  document.getElementById('btnUpdateSharedProperty').addEventListener('click', function () {
      var updateSharedPropertyID = document.getElementById('updateSharedPropertyID').value;
      var updateSharedPropertyName = document.getElementById('updateSharedPropertyName').value;
      webSqlApp.updateSharedProperty(updateSharedPropertyName, updateSharedPropertyID);
  });
  document.getElementById('btnDeleteSharedProperty').addEventListener('click', function () {
      var deleteSharedPropertyID = document.getElementById('deleteSharedPropertyID').value;
      webSqlApp.deleteSharedProperty(deleteSharedPropertyID);
  });
  document.getElementById('btnViewPropertySharedWith').addEventListener('click', function () {
      webSqlApp.viewPropertySharedWith();
  });
  document.getElementById('btnSubmitRequest').addEventListener('click', function () {
      var propertyID = document.getElementById('requestID').value;
      webSqlApp.submitRequest(propertyID);
  });
  document.getElementById('btnViewRequests').addEventListener('click', function () {
      webSqlApp.viewRequests();
  });
  document.getElementById('btnAcceptRequest').addEventListener('click', function () {
      var propertyID = document.getElementById('acceptRequestID').value;
      webSqlApp.acceptRequest(propertyID);
  });
};

function indexOnLoad(){
  var txtKey = document.getElementById('txtKey'),
      txtVal = document.getElementById('txtVal');
  var db;
  try {
      db = webSqlApp.openDb('1.0');
      webSqlApp.onSuccess('db created.');
  } catch (error) {
      console.log('Database already created');
  }
  try {
      db = webSqlApp.addTable();
  } catch (error) {
      console.log('Table already exists')
  }
  setTimeout(() => {  webSqlApp.register('admin', 'pass', 'pass', 'ADMIN', '', 'ADMIN'); }, 1000);
  setTimeout(() => {  webSqlApp.logout(); }, 1000);
};

function aboutOnLoad(){
  webSqlApp.logout();
};

function contactOnLoad(){
  webSqlApp.logout();
};

function personalOnLoad(){
  var db = webSqlApp.openDb('2.0');
  db.transaction(function (t) {
    t.executeSql('SELECT * FROM sessionUser',
        [],
        function (transaction, results) {
            document.getElementById('loginScreenFullName').innerHTML = results.rows.item(0).userFullName;
             document.getElementById('loginFullName').innerHTML = results.rows.item(0).userFullName;
             document.getElementById('loginEmail').innerHTML = results.rows.item(0).username;
        });
  }, webSqlApp.onError, webSqlApp.onSuccess("No Error"));
};

function privacyOnLoad(){
  var db = webSqlApp.openDb('2.0');
  db.transaction(function (t) {
    t.executeSql('SELECT * FROM sessionUser',
        [],
        function (transaction, results) {
             document.getElementById('loginFullName').innerHTML = results.rows.item(0).userFullName;
             if(results.rows.item(0).userType.localeCompare('ADMIN') == 0){
               document.getElementById('shareAccessFields').style.display = "none";
             }
        });
  }, webSqlApp.onError, webSqlApp.onSuccess("No Error"));
  document.getElementById('btnShareAccess').addEventListener('click', function () {
      var sharedUser = document.getElementById('emailShareAccess').value;
      webSqlApp.shareAccess(sharedUser);
  });
  document.getElementById('btnRemoveAccess').addEventListener('click', function () {
    var sharedUser = document.getElementById('emailRemoveAccess').value;
    webSqlApp.removeAccess(sharedUser);
  });
  document.getElementById('btnViewShareAccess').addEventListener('click', function () {
      webSqlApp.viewShareAccess();
  });
};

function securityOnLoad(){
  var db = webSqlApp.openDb('2.0');
  db.transaction(function (t) {
    t.executeSql('SELECT * FROM sessionUser',
        [],
        function (transaction, results) {
             document.getElementById('loginFullName').innerHTML = results.rows.item(0).userFullName;
        });
  }, webSqlApp.onError, webSqlApp.onSuccess("No Error"));
  document.getElementById('btnChangePassword').addEventListener('click', function () {
      var currentPassword = document.getElementById('currentPassword').value;
      var password = document.getElementById('password').value;
      var con_password = document.getElementById('con_password').value;
      webSqlApp.changePassword(currentPassword, password, con_password);
  });
};
