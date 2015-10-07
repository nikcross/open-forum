var result = false;
var name = login.getUser().getName();
var testPassword = file.getAttachment("/Admin/Users/"+name+"/private","password.txt");

	if(login.getPassword()==testPassword) {
		result = true;
	}
	login.clearPassword();
result;