
function ValEntrada ()
{
	var UName = $("#tbUserName").val();
	var UPwd  = $("#tbUserPassWord").val();
	
	UName = UName.toUpperCase();
	
	if (UName == "" || UPwd == "")
	{
		var txtMsg = $("#Texto1").text();
		new Messi(txtMsg, 
					{
						title: 'Kannel Mobil', 
						titleClass: 'anim error', 
						buttons: 
							[
								{
									id: 0, 
									label: 'Cerrar', 
									val: 'X'
								}
							],
						modal: true,
						width: (window.innerWidth - 25)
					});
	}
	else
	{
		$("#loadingAJAX").show();
		
		$(document).delay(1000);
		
		//if (navigator.onLine)
		if (true)
		{
			$.post("http://200.30.150.165:8080/webservidor2/mediador.php",
			{
				"pwd"	: UPwd,
				"user"	: UName
			},
			function (data)
			{
				if (data.ingreso != 1)
				{
					var txtMsg = $("#tErrorLogin").text()+ " [Online]" ;
					new Messi(txtMsg, 
						{
							title: 'Kannel Mobil', 
							titleClass: 'anim error', 
							buttons: 
								[
									{
										id: 0, 
										label: 'Cerrar', 
										val: 'X'
									}
								],
							modal: true,
							width: (window.innerWidth - 25)
						});
				}
				else
				{
					window.sessionStorage.UserLogin = UName;
					window.sessionStorage.UserEmpresa = data.usrEmpresa;
					window.sessionStorage.UserName = data.nombreUser;
					window.sessionStorage.UserPais = data.usrPais;
					window.sessionStorage.UserPromotor = data.promotor;
					window.sessionStorage.UserMaxFoto = data.max_foto;
					
					var rs = db.SELECT("movil_User", function (row)
					{
						return (row.userName == UName);
					});
					
					if (rs.length == 0)
					{
						var dataValues = 
						[
							{
								userName: UName,
								passWord: UPwd,
								userPais: data.usrPais,
								Empresa: data.usrEmpresa,
								userPromotor: data.promotor,
								max_foto: data.max_foto
							}
						];
						db.INSERT_INTO("movil_User", dataValues);
					}
					
					
					var txtMsg = $("#tLogIn").text();
					new Messi(txtMsg, 
						{
							title: 'Kannel Mobil', 
							titleClass: 'anim success', 
							buttons: 
								[
									{
										id: 0, 
										label: 'Cerrar', 
										val: 'X'
									}
								],
							modal: true,
							width: (window.innerWidth - 25),
							callback: function (val)
							{
								window.location = "#IndexPage"
							}
						});
				}
				$("#loadingAJAX").hide();
			},"json")
			.fail(function (xhr, textStatus, errorThrown)
			{
				rs = db.SELECT("movil_User", function (row)
				{
				    UName = UName + "";
				    UPwd = UPwd + "";

				    var User = row.userName + "";
				    var pwd = row.passWord + "";

				    return (User.toUpperCase() == UName.toUpperCase() && pwd.toUpperCase() == UPwd.toUpperCase());
				});
				
				if (rs.length > 0)
				{
					window.sessionStorage.UserLogin = rs[0].userName;
					window.sessionStorage.UserEmpresa = rs[0].Empresa;
					window.sessionStorage.UserPais = rs[0].userPais;
					window.sessionStorage.UserPromotor = rs[0].userPromotor;
					window.sessionStorage.UserMaxFoto = rs[0].max_foto;
					var txtMsg = $("#tLogIn").text();
					new Messi(txtMsg, 
						{
							title: 'Kannel Mobil', 
							titleClass: 'anim success', 
							buttons: 
								[
									{
										id: 0, 
										label: 'Cerrar', 
										val: 'X'
									}
								],
							modal: true,
							width: (window.innerWidth - 25),
							callback: function (val)
							{
								window.location = "#IndexPage"
							}
						});
				}
				else
				{
					var txtMsg = $("#tErrorLogin").text() + " [Offline] " + xhr.responseText;
					new Messi(txtMsg, 
						{
							title: 'Kannel Mobil', 
							titleClass: 'anim error', 
							buttons: 
								[
									{
										id: 0, 
										label: 'Cerrar', 
										val: 'X'
									}
								],
							modal: true,
							width: (window.innerWidth - 25)
						});
				}
				$("#loadingAJAX").hide();
			});
		}
		
		

	}
}
