var database = require("../db/database.js");
var mongoose = database.mongoose;
var userModel = database.dataModels.userModel;
var nodemailer = require("nodemailer");
var fs = require("fs");
var config = JSON.parse(fs.readFileSync("config.json"));
var server = config.server;
var SMPP_PORT = config.SMPP_PORT;
var SMTPAuthUser = config.SMTPAuthUser;
var SMTPAuthPwd = config.SMTPAuthPwd;
var EmailServiceProvider = config.EmailServiceProvider;

exports.addUser = function (req, res) {
    console.log("==================================Add New User API ==================================");
    var name = '';
    if (req.body.name) {
        name = req.body.name;
    }
    var number
    if (req.body.number) {
        number = req.body.number;
    }
    var ip = req.connection.remoteAddress;
    var userId = req.body.email;
    console.log("========================> " + userId)
    var password = req.body.password;
    var active = 1;
    var date = new Date();
    date = Date.UTC(date.getFullYear(), date.getMonth() + 1, date.getDate(), 0, 0, 0);


    var newCustomer = {
        _id: mongoose.Types.ObjectId(),
        name: name,
        ip: ip,
        userId: userId,
        password: password,
        active: 1,
        createdAt: date
    }
    userModel.find({ userId: userId }, function (err, data) {
        if (data.length > 0) {
            var user = {
                username: userId,
                password: password,
                name: name,
                id: data[0]._id,
                status:1,
                active:0
            }
            createAccount(user)


            res.send({ status: false, remarks: "User Already Exists" });
        }
        else {
            userModel(newCustomer).save(function (e, data) {
                if (e) {

                    res.send({ status: false, remarks: "Internal Issues" });
                }
                else {
                    var user = {
                        username: userId,
                        password: password,
                        name: name,
                        id: data._id
                    }

                  createAccount(user)
                    res.send({ status: true, remarks: "saved" });
                }
            })
        }

    });
}


exports.loginPage = function(req,res){
     console.log("-------------Login Page------------------------------");
     if (req.session.userId) {
        console.log("-----------------------------------------------");


        res.redirect('/', { title: 'Express',user:req.session.login });
    }
    else{
        console.log("Comes Here")
        res.render('login');

    }


}
exports.logout = function(req,res){
      try {
        if (req.session.userId) {
    console.log(" ======================== LOG OUT ==================================== ")
       req.session.destroy(function (err) {
                 
            res.redirect('/login');

                })

        } //    
    } catch (e) {
        res.render('error')
    }
}
exports.loginCustomer = function (req, res) {
    console.log(" ======================== Login API ==================================== ")
            console.log("body  : "+JSON.stringify(req.body))
 
     try {
        
    var userId = req.body.email;
    var password = req.body.password;

    userModel.find({ userId: userId, password: password,active:1}, function (err, data) {
        if (data.length > 0) {
            if (req.session.login) {
                req.session.destroy(function (err) {
                    req.session.userId = data[0]._id;
                    
                    req.session.login = data[0];
                    res.send({ status: true });
                })
            }
            else {
                req.session.userId = data[0]._id;
                req.session.login = data[0];
                res.send({ status: true });
            }

        }
        else {
            res.send({ status: false });

        }
    });
       
    } catch (e) {
        res.render('error')
    }
}


function createAccount(user){
    var apiName = 'create Account';
    console.log('****************API Call (' + apiName + ')****************');
    console.log('TimeStamp: ' + new Date());

    var custName = user.name;




//print params
    console.log('custId: ' + user.username);
    console.log('custName: ' + user.name);


    var content = '';

    var date = new Date();
    content = '<html><div style="text-align:left";><div style="background-color: #e8e8e8;width: 80%;">';
//************* IMAGE LOCATION ********* /opt/redmine-1.3.1-0/apache2/htdocs/img/email_banner.png **********//
    
    content += '<a href="http://flowy-flowy.rhcloud.com/"><div style="width: 100%; background-color: #eeeeee;font-weight: bold;font-size: 36px; text-align: center">MDL</div></a>';
    content += '<br/>';
    content += '<br/>';
    content += '<br/>';
    content += '<br/>';
    content += '<table width="80%" style="margin-left: 5%;">';
    content += '<tr>';
    content += '<td colspan="2">';
    content += '<span style="font-weight: Bold;color: #2e2e2e">Dear '+custName+',</span>';
    content += '<br/>';
    content += '<br/>';
    content += '<br/>';
    content += '</td></tr>';
    content += '<tr><td colspan="2">';
    content += '<span style="float:left;color: #2e2e2e">Your account has been created. Please login with mentioned credentials.<br/><br/></span></td>';
    content += '</tr>';
    content += '<tr>';
    content += '<td width="20%">';
    content += "<b> Login ID:</b>";
    content += '</td>';
    content += '<td >';
    content += user.username;
    content += '</td></tr>';
    content += '<tr>';
    content += '<td width="20%">';
    content += "<b> Password : </b>";
    content += '</td>';
    content += '<td >';
    content += user.password;
    content += '</td></tr>';
    content += '<tr>';
    content += '<td width="20%">';
    content += "<b> Link : </b>";
    content += '</td>';
    content += '<td >';
    content += '<a href="http://localhost:3000/confirmation/'+user.id+'" target="_blank">Click Here</a>';
    content += '</td></tr>';
    content += '</table>';

    content += '<br/>';
    content += '<br/>';
    content += '<span style="font-weight: Bold;color: #2e2e2e;margin-left: 5%;">Best Regargds,</span>';
    content += '<br/>';
    content += '<span style="font-weight: Bold;color: #2e2e2e;margin-left: 5%;"> Support</span>';
    content += '<br/>';
    content += '<br/>';
    content += '<br/>';
    content +=   '<div style="border-bottom:1px solid;"><div>';
    content += '<br/>';


    content +=   '<div style="float: right;">© 2015 MDL </div></html>';

//Send mail
    var subject = 'Welcome';
    console.log('****************API Call (' + user.username + ')****************');
    sendemail(user.username,content,subject,'');
}
function sendemail(email,textmessage,subject,supportGroupCCEmail)
{
    if (EmailServiceProvider != "" && SMTPAuthUser != "" && SMTPAuthPwd != '') {
        var smtpTransport = nodemailer.createTransport("SMTP", {
            service: EmailServiceProvider,
            auth: {
                user: SMTPAuthUser,
                pass: SMTPAuthPwd
            }
        });

        smtpTransport.sendMail({
            from: 'Support ' + SMTPAuthUser,
            to: email, // comma separated list of receivers
            subject: subject, // Subject line
            html: textmessage // plaintext body
        }, function (error, response) {
            if (error) {
                console.log(error);
            } else {
                console.log("Email Message sent: " + response.message);
            }
        });
    }

}
function forgotpassword(user){
    var apiName = 'Forgot Password';
    console.log('****************API Call (' + apiName + ')****************');
    console.log('TimeStamp: ' + new Date());

    var custName = user.name;




//print params
    console.log('custId: ' + user.username);
    console.log('custName: ' + user.name);


    var content = '';

    var date = new Date();
    content = '<html><div style="text-align:left";><div style="background-color: #e8e8e8;width: 80%;">';
//************* IMAGE LOCATION ********* /opt/redmine-1.3.1-0/apache2/htdocs/img/email_banner.png **********//
    
    content += '<a href="http://localhost:3000/"><div style="width: 100%; background-color: #eeeeee;font-weight: bold;font-size: 36px; text-align: center">MDL</div></a>';
    content += '<br/>';
    content += '<br/>';
    content += '<br/>';
    content += '<br/>';
    content += '<table width="80%" style="margin-left: 5%;">';
    content += '<tr>';
    content += '<td colspan="2">';
    content += '<span style="font-weight: Bold;color: #2e2e2e">Dear '+custName+',</span>';
    content += '<br/>';
    content += '<br/>';
    content += '<br/>';
    content += '</td></tr>';
    content += '<tr><td colspan="2">';
    content += '<span style="float:left;color: #2e2e2e">Please login with mentioned credentials.<br/><br/></span></td>';
    content += '</tr>';
    content += '<tr>';
    content += '<td width="20%">';
    content += "<b> Login ID:</b>";
    content += '</td>';
    content += '<td >';
    content += user.username;
    content += '</td></tr>';
    content += '<tr>';
    content += '<td width="20%">';
    content += "<b> Password : </b>";
    content += '</td>';
    content += '<td >';
    content += user.password;
    content += '</td></tr>';
    content += '</table>';

    content += '<br/>';
    content += '<br/>';
    content += '<span style="font-weight: Bold;color: #2e2e2e;margin-left: 5%;">Best Regargds,</span>';
    content += '<br/>';
    content += '<span style="font-weight: Bold;color: #2e2e2e;margin-left: 5%;">MDL Support</span>';
    content += '<br/>';
    content += '<br/>';
    content += '<br/>';
    content +=   '<div style="border-bottom:1px solid;"><div>';
    content += '<br/>';


    content +=   '<div style="float: right;">© 2015</div></html>';

//Send mail
    var subject = 'Forgot Password ';
    console.log('****************API Call (' + user.username + ')****************');
    sendemail(user.username,content,subject,'');
}


