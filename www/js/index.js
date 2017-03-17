var db;
var uriServer = "http://200.30.150.165:8080/webservidor2/mediador.php";
var maxTrans = 0;
var DownCount = 0;
var failTablesList = "";
var AddWhere = {};
var DLGrupo = null;

var FILENAME = 'database.db',
    failCB = function (msg) {
        return function () {
            alert('[FAIL] ' + msg);
        }
    };

function utf8_encode (argString) { // eslint-disable-line camelcase
  //  discuss at: http://locutus.io/php/utf8_encode/
  // original by: Webtoolkit.info (http://www.webtoolkit.info/)
  // improved by: Kevin van Zonneveld (http://kvz.io)
  // improved by: sowberry
  // improved by: Jack
  // improved by: Yves Sucaet
  // improved by: kirilloid
  // bugfixed by: Onno Marsman (https://twitter.com/onnomarsman)
  // bugfixed by: Onno Marsman (https://twitter.com/onnomarsman)
  // bugfixed by: Ulrich
  // bugfixed by: Rafał Kukawski (http://blog.kukawski.pl)
  // bugfixed by: kirilloid
  //   example 1: utf8_encode('Kevin van Zonneveld')
  //   returns 1: 'Kevin van Zonneveld'

  if (argString === null || typeof argString === 'undefined') {
    return ''
  }

  // .replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  var string = (argString + '')
  var utftext = ''
  var start
  var end
  var stringl = 0

  start = end = 0
  stringl = string.length
  for (var n = 0; n < stringl; n++) {
    var c1 = string.charCodeAt(n)
    var enc = null

    if (c1 < 128) {
      end++
    } else if (c1 > 127 && c1 < 2048) {
      enc = String.fromCharCode(
        (c1 >> 6) | 192, (c1 & 63) | 128
      )
    } else if ((c1 & 0xF800) !== 0xD800) {
      enc = String.fromCharCode(
        (c1 >> 12) | 224, ((c1 >> 6) & 63) | 128, (c1 & 63) | 128
      )
    } else {
      // surrogate pairs
      if ((c1 & 0xFC00) !== 0xD800) {
        throw new RangeError('Unmatched trail surrogate at ' + n)
      }
      var c2 = string.charCodeAt(++n)
      if ((c2 & 0xFC00) !== 0xDC00) {
        throw new RangeError('Unmatched lead surrogate at ' + (n - 1))
      }
      c1 = ((c1 & 0x3FF) << 10) + (c2 & 0x3FF) + 0x10000
      enc = String.fromCharCode(
        (c1 >> 18) | 240, ((c1 >> 12) & 63) | 128, ((c1 >> 6) & 63) | 128, (c1 & 63) | 128
      )
    }
    if (enc !== null) {
      if (end > start) {
        utftext += string.slice(start, end)
      }
      utftext += enc
      start = end = n + 1
    }
  }

  if (end > start) {
    utftext += string.slice(start, stringl)
  }

  return utftext
}

function gotFS(fs) 
{
    var fail = failCB('getFile');
    fs.root.getFile(FILENAME, {create: true, exclusive: false}, function (fileEntry)
    {
        var fail = failCB('createWriter');
        file.entry = fileEntry;
        
        fileEntry.createWriter(function (fileWriter) 
        {
            file.writer.available = true;
            file.writer.object = fileWriter;    
        }, fail);
        
        readText(file);   
    }, fail);
}

function saveText() 
{
    var name = "Hola mundo",
        desc = "es una demo",
        fail;
    dbEntries.push('<dt>' + name + '</dt><dd>' + desc + '</dd>')
    /*$('name').value = '';
    $('desc').value = '';
    $('definitions').innerHTML = dbEntries.join('');*/
    if (file.writer.available) {
        file.writer.available = false;
        file.writer.object.onwriteend = function (evt) {
            file.writer.available = true;
            file.writer.object.seek(0);
        }
        file.writer.object.write(dbEntries.join("\n"));
    }
    
}

function readText(fileToRead) 
{
    if (fileToRead.entry) 
    {
        fileToRead.entry.file(function (dbFile) 
        {
            var reader = new FileReader();
            reader.onloadend = function (evt) 
            {
                var textArray = evt.target.result.split("\n");
                dbEntries = textArray.concat(dbEntries);
                Mensage("file: ("+fileToRead.entry.fullPath+") \n" + dbEntries.toString());
                //$('definitions').innerHTML = dbEntries.join('');
            }
            reader.readAsText(dbFile);
        }, failCB("FileReader"));
    }
    return false;
}

var onSuccess = function (position) {

    
    var GPSLong = position.coords.longitude,
        GPSLat = position.coords.latitude,
        GPSAlti = position.coords.altitude;

    Mensage('Latitude: ' + GPSLat + '\n' +
          'Longitude: ' + GPSLong + '\n' +
          'Altitude: ' + GPSAlti + '\n');

    if (GPSLat != null)
    {
        window.sessionStorage.setItem("#vc_finca_latitud$", GPSLat);
    }

    if (GPSLong != null)
    {
        window.sessionStorage.setItem("#vc_finca_longitud$", GPSLong);
    }

    if (GPSAlti != null)
    {
        window.sessionStorage.setItem("#vc_finca_altitud$", GPSAlti);
    }


    
    /*+
          'Accuracy: ' + position.coords.accuracy + '\n' +
          'Altitude Accuracy: ' + position.coords.altitudeAccuracy + '\n' +
          'Heading: ' + position.coords.heading + '\n' +
          'Speed: ' + position.coords.speed + '\n' +
          'Timestamp: ' + position.timestamp + '\n'*/

    RefreshFormMobil();
};

function pad(str, max) {
    str = str.toString();
    return str.length < max ? pad("0" + str, max) : str;
}

function onError(err) 
{
    if(err.code == 1) 
    {
       Mensage("Error: Access is denied!");
    }
    else 
        if( err.code == 2) 
        {
            Mensage("Error: Position is unavailable!; Check if the GPS is on! ");
        }
}

function Mensage(texto) {
    /*$("#loadingAJAX").show();
	$("#ajaxgif").hide();*/
    new Messi(texto,
	{
	    title: 'Volcafe Way',
	    width: (window.innerWidth - 25),
        modal: true,
	    callback: function (val) {
	        
	        $("#loadingAJAX").hide();
	        $("#ajaxgif").show();
	    }
	});
}

function CreateDB(name)
{
	db = new LocalStorageDB(name);
	
		db.CREATE ("def_tables_movil", 
		{
			id: 0,
			id_obj: '', 
			project_id: 0,
			object_id: 0, 
			label: '',
			sql_colname: '',
			sql_datatype: '',
			content_type: '',
			case_sensitive: '',
			initial_value_movil: '',
		    label_eng: '',
			list_labels: '',
			list_values: '',
			sql_colnum: 0,
			sql_pk: '',
			data_source_movil: '',
			pk_pos: "0",
			enabled: '',
            visible: '',
            action_movil: '',
            required: '',
            limit: 0,
            object_functions_movil: ''
		});
		
		db.CREATE("Object_Movil",
		{
			id: 0,
			project_id: 0,
			object_id: 0,
			movil_proj: 0,
			movil_obj: 0,
			tableName: '',
			formName: '',
			obj_order: 0,
		    obj_type: ''
		});
		
		db.CREATE("Object_Det_Movil",
		{
			id: 0,
			project_id: 0,
			object_id: 0,
			content_id: 0,
			movil_proj: 0,
			movil_obj: 0,
			movil_name: '',
			movil_help: ''
		});
			
		db.CREATE("movil_User",
		{
		    id: 0,
		    userName: '',
		    passWord: '',
		    userPais: '',
		    Empresa: '',
		    userPromotor: '',
		    max_foto: 0,
            keeplogin: 0
		});
		
		db.CREATE("ListMod",
        {
            id: 0,
            tablaName: '',
            neadForm: 0,
            formTitle: '',
            sinc: 0,
            project_id: 0,
            object_id: 0,
            padre: 0,
            obj_order: 0
        });
}

function ReDowloadFoto()
{
    
    db.TRUNCATE("vc_foto");
    var count = 0;
    var Leng = 0;
    var allPaths = "";
    var allErrors = "";
    
    if (true)
    {
        //alert("Save photo to galery Loaded");
        $.post(uriServer,
        {
            "cmd": "getListaFotos",
            "User": window.sessionStorage.getItem("UserLogin")
        },function (data1)
        {
            db.INSERT_INTO("vc_foto", data1);

            var rs = db.SELECT("vc_foto");
            var forotsError = 0;
            var ban = true;

            if (rs.length > 0)
            {

                Leng = rs.length ;
                $("#loadingAJAX").show();
                $(rs).each(function (index, val)
                {
                    $.post(uriServer, 
                    {
                        "cmd": "getFotos",
                        "User": window.sessionStorage.getItem("UserLogin"),
                        "Linea": val.linea
                    },
                    function (data) 
                    {
                        

                        var serverLeng = data[0].largo * 1;
                        var downloadLeng = data[0].foto_base64 + "";
                        var file = 
                        {
                            writer: { available: false },
                            reader: { available: false }
                        }, FileName = "img_" + val.linea + ".b64", dbEntries = [];
                        
                        $("#AJAXLoadLabel").text("Download Photos "+ FileName + "/" + index + " from " + (rs.length - 1));
                        
                        downloadLeng = downloadLeng.length;
                        if (serverLeng == downloadLeng)
                        {     
                            var fail = failCB('requestFileSystem');
                            window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function (fs) 
                            {
                                var fail = failCB('getFile');
                                fs.root.getFile(FileName, {create: true, exclusive: false}, function (fileEntry)
                                {
                                    var fail = failCB('createWriter');
                                    file.entry = fileEntry;

                                    fileEntry.createWriter(function (fileWriter) 
                                    {
                                        file.writer.available = true;
                                        file.writer.object = fileWriter;  
                                        
                                        dbEntries.push(data[0].foto_base64);
                                        if (file.writer.available) 
                                        {
                                            file.writer.available = false;
                                            file.writer.object.onwriteend = function (evt) 
                                            {
                                                file.writer.available = true;
                                                file.writer.object.seek(0);
                                            }
                                            file.writer.object.write(dbEntries.join("\n"));
                                        }
                                        
                                    }, fail);

                                    //readText(file);   
                                }, fail);
                            }, fail);
                            
                            db.UPDATE("vc_foto", {'foto_base64': FileName}, {'linea': val.linea});
                            count++;
                        }
                        else
                           forotsError += 1; 
                        
                        if (index == (rs.length - 1))
                        {
                            $("#loadingAJAX").delay(2000).slideUp(500);
                            if (forotsError > 0)
                                Mensage("Photos Error = " + forotsError);
                            if (allErrors.length > 0)
                                alert(allErrors);
                           
                        }


                    }, "json");
                    /*.fail(function (a,b,c)
                    {
                        alert(b)   
                    })*/

                });


            }


        },"json");
    }
    
}

function joinGrupos ()
{
    var res = "";
    
    
    $(DLGrupo).each(function (i, ele)
    {
        if (ele != null)
            res += ele + ", ";
    });
    
    res += "$F%";
    
    res  = res.replace(", $F%", "");
    
    return res;
}

function DownLoadDataSave(Project_Id, Object_Id, strWhere, TableName, Forma, PageTitle)
{
	var rs = db.SELECT("ListMod", function (row)
			{
				return row.tablaName == TableName
			});
	
	TableName = TableName.toLowerCase();
	
	if (rs.length == 0)
	{		
		if (window.localStorage.getItem("LocalStorageDB-KannelMovil-" + TableName) == undefined)
		{
			$.post("http://200.30.150.165:8080/webservidor2/mediador.php",
			{
			    "cmd": "xmlDef",
			    "Project": Project_Id,
			    "Object": Object_Id,
			    "Where": strWhere,
			    "Usr": window.sessionStorage.getItem("UserLogin")
			},
			function (data)
			{
				var $xml = $(data);
				
				var defData = '{  "id": 0, "fuente": 0, "sinc": 0, "modifica": 0, ';
				var DataInsert = "[";
				$xml.find("ROW").each(function(index, element) 
				{
					var $SData = $(this);
					
					switch ($SData.find("SQL_DATATYPE").text())
					{
						case "IN":
						case "DE":
							var temp = $SData.find("ID").text() + "";
							temp = temp.toLowerCase();
							temp = temp.replace(TableName + "_", "");
							defData += ' "' + temp.toLowerCase() + '": 0, ';
							break;
						default:
							var temp = $SData.find("ID").text() + "";
							temp = temp.toLowerCase();
							temp = temp.replace(TableName + "_", "");
							defData += ' "' + temp.toLowerCase() + '": "", ';
							break;
					}
					
					DataInsert += ' ,{ "project_id": ' + Project_Id + ", ";
					$SData.children().each(function ()
					{
						var $subData = $(this);
						var temp = $subData[0].nodeName + "";
						temp = temp.toLowerCase();
						
						temp += (temp == "id")?"_obj":"";
						
						DataInsert += ' "' + temp + '": "' + $subData.text() + '", ' ;
					});
					
					DataInsert += "}";
						
					DataInsert = DataInsert.replace(", }", "}");
				});
				
				DataInsert += "]";
				DataInsert = DataInsert.replace("[ ,{", "[{");
				objDataInsert = JSON.parse(DataInsert);
				
				if (Forma == 1)
					db.INSERT_INTO("def_tables_movil", objDataInsert);
				
				defData += "}";
				defData = defData.replace(", }", "}");
				
				objdefData = JSON.parse(defData);
                
                if (!db.EXISTS_TABLE(TableName))			
				    db.CREATE(TableName, objdefData);

				maxTrans++;
                
                var listaDL = joinGrupos();

				$.post("http://200.30.150.165:8080/webservidor2/mediador.php", 
				{
					"cmd"		   : "xmlData",
					"Project"	   : Project_Id,
					"Object"	   : Object_Id,
					"empresa"      : window.sessionStorage.getItem("UserEmpresa"),
					"usrCode"      : window.sessionStorage.getItem("UserPromotor"),
					"usrPais"      : window.sessionStorage.getItem("UserPais"),
                    "grupoDownLoad": listaDL
				},
				function (data)
				{
					$("#dMessageBDDone").hide();
					var $xml = $(data);
								
					var DataInsert = "[";
					var refTable = db.DESCRIBE(TableName);
					$xml.find("ROW").each(function(index, element) 
					{
						var $Sdata = $(this);
						DataInsert += " ,{";
						$Sdata.children().each(function()
						{
							var $subData = $(this);
							var temp = $subData[0].nodeName + "";
							temp = temp.toLowerCase();

							if (typeof refTable[temp] == 'number')
							{
							    var tempData = $subData.text();
							    DataInsert += ' "' + temp + '": ' + ((tempData == "Empty") ? null : tempData * 1) + ', ';
							}
							else
							    DataInsert += ' "' + temp + '": "' + $subData.text() + '", ';
						});
						
						DataInsert += "}";
						
						DataInsert = DataInsert.replace(", }", "}");
						
					});
					
					DataInsert += "]";
					
					DataInsert = DataInsert.replace("[ ,{", "[{");
                    
                    DataInsert = DataInsert.replace(/NaN/g, "null");
					
					objDataInsert = JSON.parse(DataInsert);

					$("#AJAXLoadLabel").text("Descarga... " + (++DownCount) + " [" + TableName + "] " + " de " + maxTrans);
					
                    db.TRUNCATE(TableName);
					db.INSERT_INTO(TableName, objDataInsert);
					
					db.INSERT_INTO("ListMod", [{tablaName: TableName, neadForm: Forma, sinc: 1, formTitle: PageTitle, project_id: Project_Id, object_id: Object_Id}]);				
					$("#dMessageBDDone").show();
					$("#btnDBDown").hide();

					

					if (maxTrans == DownCount)
					{
					    if (failTablesList.length > 0) {
					        failTablesList += "#f$";
					        failTablesList = failTablesList.replace(", #f$", "");

					        var txtMsg = $("#msgErrortabel").text() + failTablesList + "]";
					        new Messi(txtMsg,
                            {
                                title: 'Volcafe Way',
                                titleClass: 'anim error',
                                buttons:
                                    [
                                        { id: 0, label: 'OK', val: 'Y' }
                                    ],
                                modal: true,
                                width: (window.innerWidth - 25),
                                callback: function (val) {
                                    if (val == 'Y') {
                                        $("#loadingAJAX").delay(2000).slideUp(500);
                                        failTablesList = "";
                                    }
                                }
                            });
					    }
					    else
                        {
                            //ReDowloadFoto();
                            $("#loadingAJAX").delay(2000).slideUp(500);
                        }
					        
					}

				}, "xml")
			    .fail(function ()
			    {
			        $("#AJAXLoadLabel").text("Descarga... " + (++DownCount) + " de " + maxTrans);

			        failTablesList += TableName + ", ";

			        if (maxTrans == DownCount)
			        {
			            if (failTablesList.length > 0)
			            {
			                failTablesList += "#f$";
			                failTablesList = failTablesList.replace(", #f$", "");

			                var txtMsg = $("#msgErrortabel").text();
			                new Messi(txtMsg,
                            {
                                title: 'Volcafe Way',
                                titleClass: 'anim error',
                                buttons:
                                    [
                                        { id: 0, label: 'OK', val: 'Y' }
                                    ],
                                modal: true,
                                width: (window.innerWidth - 25),
                                callback: function (val)
                                {
                                    if (val == 'Y')
                                    {
                                        $("#loadingAJAX").delay(2000).slideUp(500);
                                        failTablesList = "";
                                    }
                                }
                            });
			            }
			            else
			                $("#loadingAJAX").delay(2000).slideUp(500);
			            
			        }
			    });
				$("#dMessageNoDB").hide();
			},"xml");
		}
	}
}

function DropDataBase(name)
{
    var tablas = "LocalStorageDB-" + name + "-::tables::";
    var rs = db.SELECT("movil_User", { userName: window.sessionStorage.UserLogin });
    
    window.sessionStorage.removeItem("GPSLatAnt");
    window.sessionStorage.removeItem("GPSLongAnt");
    
    var tempPws = "";
    var tempKeep = 0;

    if (rs.length > 0)
    {
        tempPws = rs[0].passWord;
        tempKeep = rs[0].keeplogin;
    }

	if (window.localStorage.getItem(tablas) != undefined)
	{
		$("#ulModList").empty();
		var defDB = window.localStorage.getItem(tablas);
        
        defDB = JSON.parse(defDB);
        
		$.each(defDB,function (index, val)
		{
			var temp = "LocalStorageDB-" + name + "-" + val;
			window.localStorage.removeItem(temp);
		});
		
		window.localStorage.removeItem(tablas);
		
		CreateDB("KannelMovil");
		
		RefreshIndex();

		db.INSERT_INTO("movil_User", [
            {
                userName: window.sessionStorage.UserLogin,
                passWord: tempPws,
                userPais: window.sessionStorage.UserPais,
                Empresa: window.sessionStorage.UserEmpresa,
                userPromotor: window.sessionStorage.UserPromotor,
                max_foto: window.sessionStorage.UserMaxFoto,
                keeplogin: tempKeep
            }]);
	}
}

function SendFoto(rsFotos, callback)
{
    if (rsFotos.length > 0) {
        var limit = rsFotos.length;
        var strCB =
            {
                'ok': 0,
                'error': 0,
                'limit': limit
            };
        $(rsFotos).each(function (i, e) {
            var payLoad =
            {
                'cmd': "SendFoto",
                'Empresa': window.sessionStorage.getItem("UserEmpresa"),
                'usuario': window.sessionStorage.getItem("UserLogin"),
                'strFoto': e.foto_base64,
                'linea': e.linea
            };
            
            var fail = failCB('requestFileSystem');
            window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function (fs) 
            {
                var fail = failCB('getFile');
                var file = 
                        {
                            writer: { available: false },
                            reader: { available: false }
                        }, dbEntries = [], FileName = payLoad.strFoto;
                
                fs.root.getFile(FileName , {create: true, exclusive: false}, function (fileEntry)
                {
                    var fail = failCB('createWriter');
                    file.entry = fileEntry;
                    
                    if (file.entry) 
                    {
                        file.entry.file(function (dbFile) 
                        {
                            var reader = new FileReader();
                            reader.onloadend = function (evt) 
                            {
                                var textArray = evt.target.result.split("\n");
                                
                                dbEntries = textArray.concat(dbEntries);
                                payLoad.strFoto = dbEntries[0];
                                
                                $.post(uriServer, payLoad,
                                function (data) {
                                    if (limit == 1)
                                    {
                                        strCB.ok += 1;
                                        callback(strCB);
                                    }
                                    else {
                                        strCB.ok += 1;
                                        --limit;
                                    }
                                }, "json")
                                .fail(function (qXHR, textStatus, errorThrown) {
                                    console.log(qXHR);
                                    console.log(textStatus);
                                    console.log(errorThrown);
                                    if (limit == 0)
                                    {
                                        strCB.error += 1;
                                        callback(strCB);
                                    }
                                    else {
                                        strCB.error += 1;
                                        --limit;
                                    }

                                });
                                //$('definitions').innerHTML = dbEntries.join('');
                            }
                            reader.readAsText(dbFile);
                            
                        }, failCB("FileReader"));
                    }
                     
                }, fail);
                
            }, fail);
            
            
        });

    }
    else
        callback(strCB);
}

function SendGPS2Server() // TO-DO Intervala send data 
{
    if (window.sessionStorage.UserPromotor && db.EXISTS_TABLE("promotor_gps"))
    {
        var ListTables = [];
        var rs = db.SELECT("promotor_gps");
        var TempData = [];

        if (rs.length > 0)
        {
            $(rs).each(function (i, e)
            {
                delete e.modifica;
                delete e.sinc;

                var Columns = Object.keys(e);

                $(Columns).each(function (j, val)
                {
                    if (val != "id")
                        if (e[val] == "" || e[val] == null || e[val] == undefined)
                            delete e[val];
                });

                TempData.push(e);
            });

            var info = {
                "tablaName": "promotor_gps",
                "project_id": 59,
                "object_id": 144,
                "data": TempData
            };
            
            console.log(info);

            ListTables.push(info);

            var empresaVal = window.sessionStorage.getItem("UserEmpresa");
            var usrVal = window.sessionStorage.getItem("UserLogin");
            var payload = { "User": usrVal, "Empresa": empresaVal, "cmd": "SendDataFormMovil", "Data": ListTables };

            if (ListTables.length > 0)
            {
                $.post(uriServer, payload,
                function (data)
                {
                    var listTables = data;

                    $(listTables).each(function (i, e) 
                    {
                        var listOfID = e.idList;

                        $(listOfID).each(function (j, v) 
                        {
                            db.DELETE(e.tableName,{ id: v });
                        });
                    });

                },"json");
            }
        } 
    }
    
}

function SendData2DB()
{
    $("#loadingAJAX").show();
    $("#AJAXLoadLabel").text("");

    var rs = db.SELECT("ListMod",function (row)
    {
        return row.sinc == 1
        && row.neadForm == 1
        && row.tablaName != 'vc_foto'
    });
    var ListTables = [];
    var uniqueNames = [];
    if (rs.length > 0)
    {
        $.each(rs, function (i, el)
        {
            if ($.inArray(el.tablaName, uniqueNames) === -1)
                uniqueNames.push(el.tablaName);
        });
        
        $(uniqueNames).each(function (index, ele)
        {
            var rsData = db.SELECT(ele, { modifica: 1, sinc: 0 });
            var TempData = [];

            if (rsData.length > 0)
            {
                $(rsData).each(function (i, e)
                {
                    delete e.modifica;
                    delete e.sinc;

                    var Columns = Object.keys(e);

                    $(Columns).each(function (j, val)
                    {
                        if (val != "id")
                            if (e[val] == "" || e[val] == null || e[val] == undefined)
                                delete e[val];
                            /*else
                                e[val] = utf8_encode(e[val]);*/
                    });
                    
                    TempData.push(e);
                });

                var info = {
                    "tablaName": ele,
                    "data": TempData
                };

                ListTables.push(info);
            }
        });
        var empresaVal = window.sessionStorage.getItem("UserEmpresa");
        var usrVal = window.sessionStorage.getItem("UserLogin");
        var payload = { "User": usrVal, "Empresa": empresaVal, "cmd": "SendDataFormMovil", "Data": ListTables };

        if (ListTables.length > 0)
            $.post(uriServer, payload,
            function (data)
            {
                var listTables = data;

                var strTablas = $("#msgDBSincOK").text() + " ";
                var count = 0;
                $(listTables).each(function (i, e) {
                    var listOfID = e.idList;

                    strTablas += e.tableName + ", ";

                    $(listOfID).each(function (j, v) {
                        db.UPDATE(e.tableName, { sinc: 1 }, { id: v });
                        count++;
                    });

                });

                strTablas += "#fin$";

                strTablas = strTablas.replace(", #fin$", " ]");

                var rsDataFoto = db.SELECT("vc_foto", { modifica: 1, sinc: 0 });

                if (rsDataFoto.length > 0 && count > 0)
                {
                    SendFoto(rsDataFoto, function (res)
                    {
                        if (res.ok == res.limit || res.limit == undefined)
                        {
                            Mensage(strTablas);

                            delete payload.Data;

                            payload.cmd = "RunMain";

                            $.post(uriServer, payload, 
                                function (data) 
                                {
                                    if (data.OK == 1)
                                    {
                                        $("#loadingAJAX").hide();
                                        DropDataBase("KannelMovil");
                                        $("#btnDBDown").trigger("click");
                                    }
                                    else
                                    {
                                        $("#loadingAJAX").hide();
                                        Mensage("Error Al sinc.[SP Ora movil_main]");
                                    }
                                        
                                }, "json")
                                .fail(function (qXHR, textStatus, errorThrown)
                                {
                                    Mensage(qXHR.responseText);
                                    console.log(qXHR);
                                    console.log(textStatus);
                                    console.log(errorThrown);

                                    $("#loadingAJAX").hide();
                                });
                        }
                        else
                            Mensage("Error al envio de Imagenes");
                    });
                }
                else
                {
                    $("#loadingAJAX").hide();
                    if (count > 0)
                    {
                        delete payload.Data;

                        payload.cmd = "RunMain";

                        $.post(uriServer, payload,
                            function (data)
                            {
                                if (data.OK == 1)
                                {
                                    DropDataBase("KannelMovil");
                                    $("#btnDBDown").trigger("click");
                                }
                                else
                                {
                                    $("#loadingAJAX").hide();
                                    Mensage("Error Al sinc.[SP Ora movil_main]");
                                }

                            }, "json")
                            .fail(function (qXHR, textStatus, errorThrown)
                            {
                                Mensage(qXHR.responseText);
                                console.log(qXHR);
                                console.log(textStatus);
                                console.log(errorThrown);

                                $("#loadingAJAX").hide();
                            });
                    }
                    else
                    {
                        Mensage("Error Al sinc.");
                    }
                }
            }, "json")
            .fail(function (qXHR, textStatus, errorThrown)
            {
                Mensage(qXHR.responseText);
                console.log(qXHR);
                console.log(textStatus);
                console.log(errorThrown);

                $("#loadingAJAX").hide();
            });
        else
        {
            $("#loadingAJAX").hide();
            var texto = $("#lModoData").text();
            Mensage(texto);
        }
        
    }
}

function testEval ()
{
	
	$("#ulSideMenu").append("<li><a href='#' onClick='FETEST()' data-rel='close' >test2</a></li>");
	$("#ulSideMenu").listview('refresh');
	;
	var stringFuntion = "function FETEST() {alert('works ' + window.sessionStorage.getItem('empresa'));}";
	
	$.globalEval(stringFuntion);
}

function refreshGrid(tableName, proj_Id, obj_Id)
{
    var Modo = window.sessionStorage.getItem("#FromMode");
    if (Modo == "U")
    {
        window.sessionStorage.setItem("#HijoKannel", "1");
        BuildMantenimineto(tableName, proj_Id, obj_Id);
        window.sessionStorage.removeItem("#HijoKannel");
        RemoveSessionVar();
    }
    else 
    {
        Mensage("Grabe los cambios, para pasar a la siguiente pantalla. / Save the changes, to move to the next screen.")
    }
}

function BuildMantenimineto(tableName, proj_Id, obj_Id)
{
    //window.location = "#PageBuilder";

    if (!window.sessionStorage.getItem("#History"))
    {
        window.location = '#IndexPage';
        RemoveSessionVar();
        location.reload();
    }

    var Obj_History = JSON.parse(window.sessionStorage.getItem("#History"));

    var LastObj = Obj_History.pop();
    Obj_History.push(LastObj);

    var p = LastObj.path + "";

    var temp = p.split("/");
    var last = temp.pop();

    var is_hijo = window.sessionStorage.getItem("#HijoKannel");
	var PK = GetPrimaryKey(tableName, proj_Id, obj_Id);
	
	var PKs = [];
	var PkID = [];
	var Owhere = "{ ";
		
	$.each(PK, function (index, ele)
	{
	    var nombreCol = ele;

	    if (is_hijo == "1")
	    {
	        var padreTable = window.sessionStorage.getItem("#TableName");
	        nombreCol = "#P_" + padreTable + "_" + nombreCol + "$";
	    }
	    

	    var temp = window.sessionStorage.getItem(nombreCol);
		if (temp == null)
		{
		    PKs.push(ele);
		}
		else
		{
		    PkID.push(JSON.parse('{"colName": "' + ele + '", "id": ' + temp + '}'));
			Owhere += '"' + ele + '": ' + temp + ", ";
		}
	});
	
	Owhere += "}";
	Owhere = Owhere.replace (", }", "}");
	
	var JOwhere = JSON.parse(Owhere);
	
	if (last == tableName)
	{
	    var tempWhere = JSON.parse(LastObj.Where);
	    Owhere = "{ ";
	    $(tempWhere).each(function (i, v)
	    {
	        Owhere += '"' + v.colName + '": ' + v.id + ', ';
	    });

	    Owhere += "}";
	    Owhere = Owhere.replace(", }", "}");

	    JOwhere = JSON.parse(Owhere);

	    window.sessionStorage.PKID = LastObj.Where;
	}
	else
	{
	    window.sessionStorage.PKNext = PKs;
	    window.sessionStorage.PKID = JSON.stringify(PkID);

	    Obj_History.push({ 'path': p + "/" + tableName, 'pID': proj_Id, 'oID': obj_Id, 'Where': JSON.stringify(PkID), 'rowID': 0 });

	    window.sessionStorage.setItem("#History", JSON.stringify(Obj_History));
	}
	


	
	var rsTabla = db.SELECT("ListMod", function (row) {
	    return row.project_id == proj_Id &&
               row.object_id == obj_Id
	});

	if (rsTabla.length != 0) {
	    $("#lHForma").text(rsTabla[0].formTitle);
	}
	var PadrePid = 0;
	var PadreOid = 0;

	$("#ulSideMenu_PageBuilder").empty();
	var temptextOn = "window.location = '#IndexPage'; RemoveSessionVar(); location.reload();";
	var NewRegParams = "'" + tableName + "', " + proj_Id + ", " + obj_Id;
	$('#ulSideMenu_PageBuilder').html
        (
            '<li><a class="ui-btn ui-shadow ui-icon-home ui-btn-icon-left" href="#IndexPage" onClick="' + temptextOn + '" id="btn_Home">Inicio </a></li>' +
            //'<li><a href="#PageBuilder" data-rel="close" id="btnNewReg" class="ui-btn ui-shadow ui-icon-plus ui-btn-icon-left" onclick="ClickEvent_btnNewReg(' + NewRegParams + ')">Nuevo</a></li>' +
            '<li><a href="#PageBuilder" data-rel="close" id="btnGeoPos" class="ui-btn ui-shadow ui-icon-location ui-btn-icon-left" onclick="ClickEvent_btnGeoPos();">Obtener GPS</a></li>'
        );

	$('#btnNewReg').attr("onclick", "ClickEvent_btnNewReg(" + NewRegParams + ")");

	var subMods = db.SELECT("Object_Movil", function (row)
	{
	    return row.movil_proj == proj_Id && 
               row.movil_obj == obj_Id
	});

	if (subMods.length > 0)
	{
	    var DetSubMods = db.SELECT("Object_Det_Movil", function (row)
	    {
	        return row.project_id == subMods[0].project_id &&
                   row.object_id == subMods[0].object_id
	    });

	    if (DetSubMods.length > 0)
	    {
	        $(DetSubMods).each(function (i, e)
	        {
	            var infoTablasub = db.SELECT("ListMod", { project_id: e.movil_proj, object_id: e.movil_obj });
	            if (infoTablasub.length > 0)
	            {
	                var param = '"' + infoTablasub[0].tablaName + '", ' + e.movil_proj + ", " + e.movil_obj;
	                //window.location = "+'"#PageBuilder"'+"
	                $('<li>').attr({ 'class': 'liHijosHide' }).html("<a href='#PageBuilder' onClick='refreshGrid(" + param + ");' data-rel='close' >" + e.movil_name + "</a>").appendTo("#ulSideMenu_PageBuilder");
	                
	            }
	        });

	        try {
	            $('#ulSideMenu_PageBuilder').listview('refresh');
	        } catch (e){
	            $('#ulSideMenu_PageBuilder').listview();
	        }
	        
	    }
	}

	DataGrid(tableName, proj_Id, obj_Id, JOwhere);

	if (is_hijo == "1")
	{
	    $("#PageBuilder_Lista").show();
	    $("#PageBuilder_From").hide();
	    $("#btnVC_Atras").hide();
	    $("#btn_backH").show();
	    $("#btnSaveData").hide();
	    $("#btnGeoPos").hide();
	    //$("#btnNewReg").show();

	    window.sessionStorage.removeItem("#RowID");
	    window.sessionStorage.removeItem("#TableName");
	    window.sessionStorage.removeItem("#Project_id");
	    window.sessionStorage.removeItem("#Object_id");
	    RemoveSessionVar();

	    $(".liHijosShow")
            .addClass("liHijosHide")
            .removeClass("liHijosShow");
	}
    
    valLeng();
}

function GetPrimaryKey(tableName, proj_Id, obj_Id)
{
	var salida = [];
	
	var rsPK = db.SELECT("def_tables_movil", function (row)
	{
		var numCol = row.sql_colnum * 1;
		
		return  row.project_id == proj_Id &&
				row.object_id == obj_Id &&
				row.sql_pk == 'P'
	}).ORDER_BY('pk_pos ASC');
	
	if (rsPK.length > 0)
	{
		$(rsPK).each(function(index, ele) 
		{
            var colNombre = ele.id_obj;
			colNombre = colNombre.toLowerCase();
			colNombre = colNombre.replace(tableName.toLowerCase() + "_", "");
			
			salida.push(colNombre);
			
        }); 
	}
	
	return salida;
}

function extraWhere (jsonData)
{
   AddWhere = jsonData;
}

function chuqueGrupo(idRow, cant, grupo)
{
    var valor = $(idRow+ "_val").val();
        
    var equa = $("#lContGrupo").html();
    var y = eval(equa);
    var x = Math.trunc(400 * y);
    
    cant *= (valor == '0')?1:-1;
    x = x + cant;
    
    if (x <= 400)
    {
        var temp = idRow.replace("#row_", "") * 1;
        
        if (valor == '0')
        {
            $(idRow + " td").addClass("selected");
            $(idRow+ "_val").val("1");
             
            DLGrupo[temp] = grupo;
        }
        else
        {
            $(idRow + " td").removeClass("selected");
            $(idRow+ "_val").val("0");
            
            DLGrupo[temp] = null;
        }
        
        $("#lContGrupo").html(x + "/400");
    }
}

function getGruposProd()
{
    $("#downLoadDiv").empty();
    $("<form>").html('<input id="filterTable-inpu3t" data-type="search">').appendTo("#downLoadDiv");
    $("#filterTable-inpu3t").textinput();
    $('<table>').attr({ 'id': 'DLGDownload_Tabla', 'data-role': 'table', 'class': 'ui-responsive table-stroke', 'data-filter': 'true', 'data-input': '#filterTable-inpu3t' }).appendTo("#downLoadDiv");
    $('<thead>').html('<tr></tr>').appendTo("#DLGDownload_Tabla");
    $('<tbody>').appendTo("#DLGDownload_Tabla");
    
    $.post(uriServer, 
    {
        "cmd"       : "listGrupsProd",
        "empresa"   : window.sessionStorage.getItem("UserEmpresa"),
        "user"      : window.sessionStorage.getItem("UserPromotor")
    }, 
    function (data) 
    {
        rs = data.Datos;
        
        $('<th>').html('#').appendTo("#DLGDownload_Tabla tr:first");
        $('<th>').html(data.Headers[0].nombre).appendTo("#DLGDownload_Tabla tr:first");
        $('<th>').html(data.Headers[0].cant).appendTo("#DLGDownload_Tabla tr:first");
        
        $(rs).each(function (i, ele) 
        {
            var tempID = "row_" + i;
            
            $('<tr>').attr({'id' : tempID, 'onclick': "chuqueGrupo('#"+tempID+"', " + ele.cant + ", " + ele.grupo + ")"}).appendTo("#DLGDownload_Tabla tbody");
            
            tempID = "#" + tempID;
            
            $('<td>').html(ele.grupo).appendTo(tempID);
            $('<td>').html(ele.Nombre).appendTo(tempID);
            $('<td>').html(ele.cant).appendTo(tempID);
            $('<input>').attr({'value': 0, 'id': "row_" + i + "_val"}).css({"visibility": "hidden", "width": "5px"}).appendTo(tempID + " td:first");
            
        });
        
        DLGrupo = Array(rs.length);
        for (var i = 0; i < rs.length; i++)
        {
           DLGrupo[i] = null; 
        }
        
    }, "json");
    
    try
    {
        $("#DLGDownload_Tabla").table(
            {
                columnPopupTheme: "a",
                refresh: null
            });

        $("#DLGDownload_Tabla").table("refresh");
    }
    catch(Ex)
    {
        $("#DLGDownload_Tabla").table("refresh");
    }
    
    window.location = '#DLGDownload';
}

function DataGrid(tableName, proj_Id, obj_Id, Owhere)
{
    var ComeFForm = window.sessionStorage.getItem("#tf$");
    window.sessionStorage.removeItem("#tf$");
    window.sessionStorage.setItem("#TableWhere", JSON.stringify(Owhere));

    $("#PageBuilder_Lista").empty();
    $('<form>').html('<input id="filterTable-inpu2t" data-type="search">').appendTo("#PageBuilder_Lista");
    $("#filterTable-inpu2t").textinput();
    $('<table>').attr({ 'id': 'PageBuilder_Tabla', 'data-role': 'table', 'class': 'ui-responsive table-stroke', 'data-filter': 'true', 'data-input': '#filterTable-inpu2t' }).appendTo("#PageBuilder_Lista");
    $('<thead>').html('<tr><th >Ver / Show</th></tr>').appendTo("#PageBuilder_Tabla");
    $('<tbody>').appendTo("#PageBuilder_Tabla");

    //$("#PageBuilder_Lista").trigger("create");

    
    var lastHist = JSON.parse(window.sessionStorage.getItem("#History"));
    lastHist = lastHist.pop();
	
	tableName = tableName.toLowerCase();
    
	var rs = db.SELECT("def_tables_movil", function (row)
	{
		var numCol = row.sql_colnum * 1;
		
		return  row.project_id == proj_Id &&
				row.object_id == obj_Id &&
				numCol > 0
	}).ORDER_BY('sql_colnum ASC');
	
	if (rs.length != 0)
	{
		var $jqRS = $(rs);
		$jqRS.each(function(index, ele1) 
		{
		    $('<th>').attr({ 'data-priority': (index + 1) }).html(ele1.label).appendTo("#PageBuilder_Tabla tr:first");
		});
        
        var Code = rs[0].object_functions_movil + "";
        Code = Code.replace(/~/g, '"');  
        
        if (proj_Id == 55 && obj_Id == 66)
        {
            Owhere["opcion"] = 2;
        }
        
		var DataRs = db.SELECT(tableName, Owhere).LIMIT(1000); // max Data to display
		
		if (DataRs.length > 0)
		{
		    var $jqDataRS = $(DataRs);

		    var rowCont = 0;
		    $jqDataRS.each(function (index, element)
		    {
		        rowCont++;

		        var tempID = "row_" + index;

		        var params = '"' + tableName + '", ' + proj_Id + ", " + obj_Id + ", " + element.id;
                
		        $('<tr>').attr({ 'id': tempID, 'onclick':"BuildFormMobil(" + params + ")" }).appendTo("#PageBuilder_Tabla tbody");

		        var regClass = "";
		        if (element.modifica == "1")
		        {
		            if (element.sinc == "0") // Modificado, sin Acrulizar a la base de datos
		                if (element.fuente == "2")
		                    regClass = "regNew";
		                else
		                    regClass = "regModificado";
		            else                     //Modificado, actulizado en la base de datos
		                regClass = "regMod-and-sinc";

		        }
		        else
		            regClass = "regNone";

		        tempID = "#" + tempID;

		        $('<td>')
                    .attr({ 'class': regClass })
                    .html("<a class='btnVer ui-btn ui-shadow ui-corner-all ui-icon-action ui-btn-icon-notext ui-btn-b' data-transition='slide' href='#PageBuilder' onclick='BuildFormMobil(" + params + ")' >Ir.</a>")
                    .appendTo(tempID);
                
		        $jqRS.each(function (index, ele1)
		        {
		            var temp = ele1.id_obj;
		            temp = temp.toLowerCase();
		            temp = temp.replace(tableName + "_", "");

		            var result = element[temp];

		            $('<td>')
                        .html(result)
                        .appendTo(tempID);
		            
		        });

		        
		    });
		    try
		    {
		        $("#PageBuilder_Tabla").table(
                    {
                        columnPopupTheme: "a",
                        refresh: null
                    });

		        $("#PageBuilder_Tabla").table("refresh");
		    }
		    catch(Ex)
		    {
		        $("#PageBuilder_Tabla").table("refresh");
		    }

		    $("#PageBuilder_Lista").trigger("create");

		}
		else {
		    Mensage('no data');
		    //$("#btn_Home").trigger("click");
		}
		
		$("#PageBuilder_From").hide();
		$("#PageBuilder_Tabla").show();
		$("#btnVC_Atras").hide();
		$("#btn_backH").show();
		$("#btnSaveData").hide();
		$("#btnNewReg").show();
		$("#btnGeoPos").hide();
        
        if (Code.length > 0)
        {
            $.globalEval(Code);
        }
        
		var PathTable = lastHist.path + "";
		PathTable = PathTable.split("/");
		PathTable = PathTable.pop();

		ComeFForm = (ComeFForm == undefined || ComeFForm == null) ? 0 : ComeFForm;

		if (PathTable == tableName && lastHist.rowID > 0 && ComeFForm == 0)
		{
		    BuildFormMobil(PathTable, lastHist.pID, lastHist.oID, lastHist.rowID);
		}
	}
}

function FillComboQuery(tableName, OWhere, ColumnName, initVal)
{
    var DisabelVar = window.sessionStorage.getItem("#PKDisable");

    DisabelVar = (DisabelVar == "null") ? null : DisabelVar;

    if (initVal == undefined || initVal == null)
        initVal = window.sessionStorage.getItem("#initValue$");

    var tempID = window.sessionStorage.getItem("#IdElementTep");
    if (tempID != null)
    {
        var rs = db.SELECT(tableName, OWhere);
        var idSinHash = tempID.toString().replace("#", "");
        if (rs.length > 0)
        {
            $("<select>").attr({ 'id': idSinHash, 'disabled': DisabelVar, 'onblur': 'saveTemVal("#' + idSinHash + '", "");' }).appendTo(tempID + "_div");
            $("<option>").attr({ 'value': 'Empty' }).html("Select One.").appendTo(tempID);

            $(rs).each(function (index, ele)
            {
                var colVal = ColumnName[0];
                var colLabel = ColumnName[1];

                if (ele[colVal] == initVal)
                    $("<option>").attr({ 'value': ele[colVal], 'selected': 'selected' }).html(ele[colLabel]).appendTo(tempID);
                else
                    $("<option>").attr({ 'value': ele[colVal] }).html(ele[colLabel]).appendTo(tempID);
            });
            
            $(tempID).selectmenu();
            
            $(tempID + "-menu").on("listviewcreate", function(e)
            {
                var IDH = "#" + e.target.id;
                
                IDH = IDH.replace("-menu", "");
                
                var input,
                    listbox = $( tempID + "-listbox" ),
                    form = listbox.jqmData( "filter-form" ),
                    listview = $( e.target );
                // We store the generated form in a variable attached to the popup so we
                // avoid creating a second form/input field when the listview is
                // destroyed/rebuilt during a refresh.
                if ( !form ) {
                    input = $( "<input data-type='search'></input>" );
                    form = $( "<form></form>" ).append( input );
                    input.textinput();
                    $( tempID + "-listbox" )
                        .prepend( form )
                        .jqmData( "filter-form", form );
                }
                // Instantiate a filterable widget on the newly created listview and
                // indicate that the generated input is to be used for the filtering.
                listview.filterable({ input: input });
            })
            .on( "pagebeforeshow pagehide", function(e) 
            {
                $(this).addClass("ui-page-theme-b").removeClass("ui-page-theme-a");

                var form = $( tempID + "-listbox" ).jqmData( "filter-form" ),
                    placeInDialog = ( e.type === "pagebeforeshow" ),
                    destination = placeInDialog ? $( e.target ).find( ".ui-content" ) : $( tempID + "-listbox" );
                form
                    .find( "input" )
                    // Turn off the "inset" option when the filter input is inside a dialog
                    // and turn it back on when it is placed back inside the popup, because
                    // it looks better that way.
                    .textinput( "option", "inset", !placeInDialog )
                    .end()
                    .prependTo( destination );

                $(".ui-body-a").addClass("ui-body-b").removeClass("ui-body-a");
            });
        }
    }
}

function RE_BuildForm(tableName, project_id, object_id)
{
    $("#PageBuilder_From").empty();
    
    var rs = db.SELECT("def_tables_movil", function (row)
	{
	    return row.project_id == project_id &&
				row.object_id == object_id 
	});
    
    if (rs.length > 0)
    {
        $(rs).each(function(i, ele)
        {
            var InputValue = null;

		    var idJQ = '#' + ele.id_obj;

		    var disableVar = null;
		    var VisibleVar = (ele.sql_colnum == 0) ? "hidden" : "visible";
            
            var Etiqueta = ele.label;
            
            if (ele.enabled == "N")
            {
                disableVar = 'disabled';
            }
                

		    if (ele.sql_pk == "P")
		    {
                if (window.sessionStorage.getItem("#FromMode") == "U")
		          disableVar = 'disabled';

		        var temp = ele.id_obj + "";
		        temp = temp.toLocaleLowerCase();
                
                InputValue = window.sessionStorage.getItem("#P_" + temp + "$");
                
                Etiqueta = "*" + Etiqueta;
		    }
		    else
		    {
		        var temp = ele.id_obj + "";
		        temp = temp.toLocaleLowerCase();
                
                InputValue = window.sessionStorage.getItem("#" + temp + "$");
		    }
            
            var IDObjDiv = "#" + ele.id_obj + "_div";

		    $('<div>')
                .attr({ 'id': ele.id_obj + "_div" })
                .appendTo("#PageBuilder_From");
            
		    if (ele.visible == "N")
		        $(IDObjDiv).hide();
            
            
            
            if (ele.required == 'S')
                Etiqueta = "*" + Etiqueta;
            
		    $('<label>').attr({ 'for': ele.id_obj }).html(Etiqueta).appendTo(IDObjDiv);
            
            switch (ele.content_type)
		    {
		        case "D":
		            switch (ele.sql_datatype) {
		                case "IN":
		                case "DE":
                            var tempMaxValue = "";
                            for (var i = 0; i < ele.limit; i++)
                            {
                                tempMaxValue += "9";
                            }
                                
		                    $('<input>')
                                .attr({ 'type': 'number', 'id': ele.id_obj, 'disabled': disableVar, 'value': InputValue, 'max': tempMaxValue, 'onblur': 'saveTemVal("#' + ele.id_obj + '", "' + ele.sql_datatype + '");' })
                                .appendTo(IDObjDiv);
		                    
		                    $(idJQ).textinput();
		                    break;
		                case "VA":
		                    $('<input>')
                                .attr({ 'type': 'text', 'id': ele.id_obj, 'disabled': disableVar, 'value': InputValue, 'maxlength': ele.limit, 'onblur': 'saveTemVal("#' + ele.id_obj + '", "");' })
                                .appendTo(IDObjDiv);
		                    
		                    $(idJQ).textinput();
		                    break;
		                case "DA":
		                case "DT":
		                    InputValue = InputValue + "";

		                    var FechaSplit = InputValue.split("/");
		                    if (FechaSplit.length > 0 && FechaSplit[0].length == 2)
		                    {
		                        var Dia = FechaSplit[0] * 1;
		                        var Mes = (FechaSplit[1] * 1) - 1;
		                        var Anio = (FechaSplit[2] * 1) % 100;

		                        Anio = Anio > 50 ? Anio + 1900 : Anio + 2000;

		                        var fecha = new Date(Anio, Mes, Dia);
                                
		                        InputValue = fecha.getFullYear() + "-" + pad((fecha.getMonth() + 1) + "",2) + "-" + pad(fecha.getDate() + "", 2);
		                    }

                            
		                    $('<input>')
                                .attr({ 'type': 'date', 'data-clear-btn': 'true', 'disabled': disableVar, 'id': ele.id_obj, 'onblur': 'saveTemVal("#' + ele.id_obj + '", "");' })
                                .appendTo(IDObjDiv);
                            $(idJQ).val(InputValue);
		                    $(idJQ).textinput();
                            
                            
                            
		                    break;
		            }
		            break;
		        case "C":
		            var check = (InputValue == 1) ? true : false;
		            $('<input>').attr({ 'type': 'checkbox', 'id': ele.id_obj, 'disabled': disableVar, 'onchange': 'saveTemVal("#' + ele.id_obj + '", "CB");', 'checked': check })
                        .appendTo(IDObjDiv);
		            $(idJQ).checkboxradio();
		            break;
		        case "B":
		            var tempID = "#" + ele.id_obj;
		            $("<select>").attr({ 'id': ele.id_obj, 'disabled': disableVar, 'onblur': 'saveTemVal("#' + ele.id_obj + '", "");' }).appendTo(IDObjDiv);
		            $("<option>").attr({ 'value': 'Empty' }).html(ele.label).appendTo(tempID);

		            var listL_S = ele.list_labels + "";
		            var listV_S = ele.list_values + "";

		            listL = listL_S.split(",");
		            listV = listV_S.split(",");

		            $.each(listL, function (i, valor) {
		                if (InputValue == listV[i])
		                    $("<option>").attr({ 'value': listV[i], 'selected': 'selected' }).html(valor).appendTo(tempID);
		                else
		                    $("<option>").attr({ 'value': listV[i] }).html(valor).appendTo(tempID);
		            });
		            $(idJQ).selectmenu();
		            break;
		        case "Q":
		        case "E":
		            var tempID = "#" + ele.id_obj;
		            var code = ele.data_source_movil;
		            code = code.replace(/~/g, '"');
		            window.sessionStorage.setItem("#IdElementTep", tempID);
		            window.sessionStorage.setItem("#initValue$", InputValue);
		            window.sessionStorage.setItem("#PKDisable", disableVar);
		            $.globalEval(code);
		            window.sessionStorage.removeItem("#IdElementTep");
		            window.sessionStorage.removeItem("#initValue$");
		            window.sessionStorage.removeItem("#PKDisable");
		            break;
                case "X":
                    $("<img>")
                        .attr({'id':  ele.id_obj + "_img", 'src':'img/logo.png', 'style':'width: 170px; height: 200px;display: block;margin-left: auto;margin-right: auto'})
                        .appendTo(IDObjDiv);
                    $("<input>").attr({'id':  ele.id_obj, 'type': 'hidden', 'value': InputValue}).appendTo(IDObjDiv);
                    
                    $(IDObjDiv).addClass("centerContent");
                    break;
		    }
          //Add extra Evenets.  
            var ActionCode = ele.action_movil + "";
            ActionCode = ActionCode.replace(/~/g,'"');
		    $.globalEval(ActionCode);
            
        });
    }
}

function CQDRefreshForm(idObj, tableName, project_id, object_id, rowID)
{
    saveTemVal("#" + idObj, "");
    window.sessionStorage.setItem("#SiMSG", "1");
    
    
    var pks = GetPrimaryKey(tableName, project_id, object_id);
    var ban = false;
    $(pks).each(function (i, ele)
    {
        var temp = ele + "";
        temp = tableName + "_" + temp;
        temp = temp.toUpperCase();
        if (idObj == temp)
        {
            var tempVal = $("#" + idObj).val();
            window.sessionStorage.setItem("#P_" + idObj.toLowerCase() + "$", tempVal);
            ban = true;
        }
    });
        
    if (!ban)
    {
        var tempVal = $("#" + idObj).val();
        window.sessionStorage.setItem("#" + idObj.toLowerCase() + "$", tempVal)
    }
    
    /*$("#btnSaveData").trigger("click");

    if (window.sessionStorage.getItem("#FromMode") == "I")
        rowID = window.sessionStorage.getItem("#RowID");

    //$("#btnVC_Atras").trigger("click");*/
    RE_BuildForm(tableName, project_id, object_id);
}

function FillComboQueryD(tableName, OWhere, ColumnName, initVal)
{
    var OrowID = window.sessionStorage.getItem("#RowID");
    var OtableName = window.sessionStorage.getItem("#TableName");
    var tempID = window.sessionStorage.getItem("#IdElementTep");
    var OPID = window.sessionStorage.getItem("#Project_id");
    var OOID = window.sessionStorage.getItem("#Object_id");

    var DisabelVar = window.sessionStorage.getItem("#PKDisable");

    DisabelVar = (DisabelVar == "null") ? null : DisabelVar;

    if (initVal == undefined || initVal == null)
        initVal = window.sessionStorage.getItem("#initValue$");

    if (OrowID != null && OtableName != null && tempID != null)
    {
        var rs = db.SELECT(tableName, OWhere);
        var idSinHash = tempID.toString().replace("#", "");
        if (rs.length > 0) {
            $("<select>").attr({ 'id': idSinHash, 'disabled': DisabelVar, 'onchange': 'CQDRefreshForm("' + idSinHash + '", "' + OtableName + '", ' + OPID + ', ' + OOID + ', ' + OrowID + ');' }).appendTo(tempID + "_div");
            $("<option>").attr({ 'value': 'Empty' }).html("Select One.").appendTo(tempID);

            $(rs).each(function (index, ele) {
                var colVal = ColumnName[0];
                var colLabel = ColumnName[1];

                if (ele[colVal] == initVal)
                    $("<option>").attr({ 'value': ele[colVal], 'selected': 'selected' }).html(ele[colLabel]).appendTo(tempID);
                else
                    $("<option>").attr({ 'value': ele[colVal] }).html(ele[colLabel]).appendTo(tempID);
            });

            $('select').selectmenu();
        }
    }
}

function RefreshFormMobil()
{
    var list_str = window.sessionStorage.getItem("#listOFKeys");

    list_str = list_str + "";

    list_str = list_str.split(",");

    var TableName = window.sessionStorage.getItem("#TableName");
    var rowID = window.sessionStorage.getItem("#RowID");

    $.each(list_str, function (i, e)
    {
        var key = e + "";
        var inputVal = window.sessionStorage.getItem(key);

        key = key.replace("P_", "");
        key = key.replace("$", "");

        key = key.toUpperCase();

        $(key).val(inputVal);
    });

    
}

function saveTemVal(idName, DataType)
{
    if (DataType == "IN")
    {
        $(idName).val($(idName).val().replace(/[^\d].+/, ""));
    }

    var tempVal = $(idName).val();

    if (DataType == "CB")
    {
        tempVal = $(idName).is(":checked") ? 1 : 0;
    }

    idName = idName + "$";
    idName = idName.toLowerCase();

    window.sessionStorage.setItem(idName, tempVal);
}

function BuildFormMobil(tableName, project_id, object_id, rowID)
{
    window.sessionStorage.setItem("#RowID", rowID);
    window.sessionStorage.setItem("#TableName", tableName);
    window.sessionStorage.setItem("#Project_id", project_id);
    window.sessionStorage.setItem("#Object_id", object_id);
    window.sessionStorage.setItem("#FromMode", "U");

    var ObjHist = JSON.parse(window.sessionStorage.getItem("#History"));
    var lastHist = ObjHist.pop();

    lastHist.rowID = rowID;

    ObjHist.push(lastHist);

    window.sessionStorage.setItem("#History", JSON.stringify(ObjHist));

    $(".liHijosHide")
        .addClass("liHijosShow")
        .removeClass("liHijosHide");

    var listOFKeys = [];

	$("#PageBuilder_From").empty();
	
	var rs = db.SELECT("def_tables_movil", function (row)
	{
	    return row.project_id == project_id &&
				row.object_id == object_id 
	});

	var rsData = db.SELECT(tableName, { id: rowID });
	
	if (rs.length != 0)
	{
		$jqrs = $(rs);
		
		var textHtml = "";
		
		$jqrs.each(function (index, ele)
		{
		    var tempID = ele.id_obj + "";
		    tempID = tempID.toLowerCase().replace(tableName + "_", "");

		    var InputValue = (rsData[0][tempID] == undefined) ? '' : rsData[0][tempID];

		    var idJQ = '#' + ele.id_obj;

		    var disableVar = null;
		    var VisibleVar = (ele.sql_colnum == 0) ? "hidden" : "visible";
            
            if (ele.enabled == "N")
            {
                disableVar = 'disabled';
            }
            
            var Etiqueta = ele.label;

		    if (ele.sql_pk == "P")
		    {
		        disableVar = 'disabled';

		        var temp = ele.id_obj + "";
		        temp = temp.toLocaleLowerCase();
		        window.sessionStorage.setItem("#P_" + temp + "$", InputValue);

		        listOFKeys.push("#P_" + temp + "$");
                
                Etiqueta = "*" + Etiqueta;
		    }
		    else
		    {
		        var temp = ele.id_obj + "";
		        temp = temp.toLocaleLowerCase();
		        window.sessionStorage.setItem("#" + temp + "$", InputValue);

		        listOFKeys.push("#" + temp + "$");

		    }

		    var IDObjDiv = "#" + ele.id_obj + "_div";

		    $('<div>')
                .attr({ 'id': ele.id_obj + "_div" })
                .appendTo("#PageBuilder_From");
		    if (ele.visible == "N")
		        $(IDObjDiv).hide();
            
            if (ele.required == 'S')
                Etiqueta = "*" + Etiqueta;
            
		    $('<label>').attr({ 'for': ele.id_obj }).html(Etiqueta).appendTo(IDObjDiv);

		    switch (ele.content_type)
		    {
		        case "D":
		            switch (ele.sql_datatype) {
		                case "IN":
		                case "DE":
                            var tempMaxValue = ""
                            for (var i = 0; i < ele.limit; i++)
                            {
                                tempMaxValue += "9";
                            }
		                    $('<input>')
                                .attr({ 'type': 'number', 'id': ele.id_obj, 'disabled': disableVar, 'value': InputValue, 'max': tempMaxValue, 'onblur': 'saveTemVal("#' + ele.id_obj + '", "' + ele.sql_datatype + '");' })
                                .appendTo(IDObjDiv);
		                    
		                    $(idJQ).textinput();
		                    break;
		                case "VA":
		                    $('<input>')
                                .attr({ 'type': 'text', 'id': ele.id_obj, 'disabled': disableVar, 'value': InputValue, 'maxlength': ele.limit, 'onblur': 'saveTemVal("#' + ele.id_obj + '", "");' })
                                .appendTo(IDObjDiv);
		                    
		                    $(idJQ).textinput();
		                    break;
		                case "DA":
		                case "DT":
		                    InputValue = InputValue + "";

		                    var FechaSplit = InputValue.split("/");
		                    if (FechaSplit.length > 0 && FechaSplit[0].length == 2)
		                    {
		                        var Dia = FechaSplit[0] * 1;
		                        var Mes = (FechaSplit[1] * 1) - 1;
		                        var Anio = (FechaSplit[2] * 1) % 100;

		                        Anio = Anio > 50 ? Anio + 1900 : Anio + 2000;

		                        var fecha = new Date(Anio, Mes, Dia);
                                
		                        InputValue = fecha.getFullYear() + "-" + pad((fecha.getMonth() + 1) + "",2) + "-" + pad(fecha.getDate() + "", 2);
		                    }
                            else
                            {
                                var FechaSplitIOS = InputValue.split("-");
                                
                                if (FechaSplitIOS.length > 0)
                                {
                                    var Dia = FechaSplitIOS[0] * 1;
                                    var Mes = FechaSplitIOS[1];
                                    var Anio = (FechaSplitIOS[2] * 1) % 100;

                                    Anio = Anio > 50 ? Anio + 1900 : Anio + 2000;

                                    var fecha = new Date(Mes + " " + Dia + ", " + Anio);
                                
                                    InputValue = fecha.getFullYear() + "-" + pad((fecha.getMonth() + 1) + "",2) + "-" + pad(fecha.getDate() + "", 2);
                                    
                                }
                            }
                                

                            
		                    $('<input>')
                                .attr({ 'type': 'date', 'data-clear-btn': 'true', 'disabled': disableVar, 'id': ele.id_obj, 'onblur': 'saveTemVal("#' + ele.id_obj + '", "");' })
                                .appendTo(IDObjDiv);
                            $(idJQ).val(InputValue);
		                    $(idJQ).textinput();
                            
                            
                            
		                    break;
		            }
		            break;
		        case "C":
		            var check = (InputValue == 1) ? true : false;
		            $('<input>').attr({ 'type': 'checkbox', 'id': ele.id_obj, 'disabled': disableVar, 'onchange': 'saveTemVal("#' + ele.id_obj + '", "CB");', 'checked': check })
                        .appendTo(IDObjDiv);
		            $(idJQ).checkboxradio();
		            break;
		        case "B":
		            var tempID = "#" + ele.id_obj;
		            $("<select>").attr({ 'id': ele.id_obj, 'disabled': disableVar, 'onblur': 'saveTemVal("#' + ele.id_obj + '", "");' }).appendTo(IDObjDiv);
		            $("<option>").attr({ 'value': 'Empty' }).html(ele.label).appendTo(tempID);

		            var listL_S = ele.list_labels + "";
		            var listV_S = ele.list_values + "";

		            listL = listL_S.split(",");
		            listV = listV_S.split(",");

		            $.each(listL, function (i, valor) {
		                if (InputValue == listV[i])
		                    $("<option>").attr({ 'value': listV[i], 'selected': 'selected' }).html(valor).appendTo(tempID);
		                else
		                    $("<option>").attr({ 'value': listV[i] }).html(valor).appendTo(tempID);
		            });
		            $(idJQ).selectmenu();
		            break;
		        case "Q":
		        case "E":
		            var tempID = "#" + ele.id_obj;
		            var code = ele.data_source_movil;
		            code = code.replace(/~/g, '"');
		            window.sessionStorage.setItem("#IdElementTep", tempID);
		            window.sessionStorage.setItem("#initValue$", InputValue);
		            window.sessionStorage.setItem("#PKDisable", disableVar);
		            $.globalEval(code);
		            window.sessionStorage.removeItem("#IdElementTep");
		            window.sessionStorage.removeItem("#initValue$");
		            window.sessionStorage.removeItem("#PKDisable");
		            break;
                case "X":
                    $("<img>")
                        .attr({'id':  ele.id_obj + "_img", 'src':'img/logo.png', 'style':'width: 170px; height: 200px;display: block;margin-left: auto;margin-right: auto'})
                        .appendTo(IDObjDiv);
                    
                    $("#" + ele.id_obj + "_img").on("click", function(e)
                    {
                        var $EleFoto = $(this)
                        tomarFoto(1, function (urlFoto)
                        {
                            var PhotoW = window.sessionStorage.getItem("#PhotoWidth");
                            var PhotoH = window.sessionStorage.getItem("#PhotoHeight");
                            
                            PhotoH = (PhotoH == undefined || PhotoH == null) ? 200 : (PhotoH * 1);
                            PhotoW = (PhotoW == undefined || PhotoW == null) ? 170 : (PhotoW * 1);
                            
                            getDataUri(urlFoto, PhotoW, PhotoH, function (imgBase64)
                            {
                                $EleFoto.attr('src', "data:image/jpg;base64," + imgBase64);
                                var foto_Linea = "#" + $EleFoto.attr('id').replace("_img", "");  

                                var RSmaxFoto = db.SELECT("movil_User", { userName: window.sessionStorage.UserLogin });
                                var maxFoto = RSmaxFoto[0].max_foto;

                                var file = 
                                {
                                    writer: { available: false },
                                    reader: { available: false }
                                }, FileName = "img_" + ((maxFoto * 1) + 1) + ".b64", dbEntries = [];

                                var fail = failCB('requestFileSystem');
                                window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function (fs) 
                                {
                                    var fail = failCB('getFile');
                                    fs.root.getFile(FileName, {create: true, exclusive: false}, function (fileEntry)
                                    {
                                        var fail = failCB('createWriter');
                                        file.entry = fileEntry;

                                        fileEntry.createWriter(function (fileWriter) 
                                        {
                                            file.writer.available = true;
                                            file.writer.object = fileWriter;  

                                            dbEntries.push(imgBase64);
                                            if (file.writer.available) 
                                            {
                                                file.writer.available = false;
                                                file.writer.object.onwriteend = function (evt) 
                                                {
                                                    file.writer.available = true;
                                                    file.writer.object.seek(0);
                                                }
                                                file.writer.object.write(dbEntries.join("\n"));
                                                
                                                ClickEvent_btnSaveData();
                                            }

                                        }, fail);
                                    }, fail);
                                }, fail);

                                db.INSERT_INTO("vc_foto", [
                                {
                                    'linea': (maxFoto * 1) + 1,
                                    'foto_base64': FileName,
                                    'usuario': window.sessionStorage.UserLogin,
                                    'modifica': 1,
                                    'fuente': 2
                                }]);
                                
                                $(foto_Linea).val((maxFoto * 1) + 1);

                                db.UPDATE("movil_User", { max_foto: ((maxFoto * 1) + 1) }, { userName: window.sessionStorage.UserLogin });
                                window.sessionStorage.setItem("UserMaxFoto", ((maxFoto * 1) + 1));
                                
                                
                            });
                            
                            window.sessionStorage.removeItem("#PhotoWidth");
                            window.sessionStorage.removeItem("#PhotoHeight");
                        });
                    });
                    //
                    $("<input>").attr({'id':  ele.id_obj, 'type': 'hidden', 'value': InputValue}).appendTo(IDObjDiv);
                    
                    rs = db.SELECT("vc_foto", {linea: InputValue});
                    
                    if (rs.length > 0)
                    {
                        var fail = failCB('requestFileSystem');
                        var IDFoto = "#" + ele.id_obj + "_img";
                        try
                        {
                            window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function (fs) 
                            {
                                var fail = failCB('getFile');
                                var file = 
                                        {
                                            writer: { available: false },
                                            reader: { available: false }
                                        }, dbEntries = [], FileName = rs[0].foto_base64;

                                fs.root.getFile(FileName , {create: true, exclusive: false}, function (fileEntry)
                                {
                                    var fail = failCB('createWriter');
                                    file.entry = fileEntry;

                                    if (file.entry) 
                                    {
                                        file.entry.file(function (dbFile) 
                                        {
                                            var reader = new FileReader();
                                            reader.onloadend = function (evt) 
                                            {
                                                var textArray = evt.target.result.split("\n");

                                                dbEntries = textArray.concat(dbEntries);

                                                $(IDFoto).attr('src', "data:image/jpg;base64," + dbEntries[0]);
                                                //$('definitions').innerHTML = dbEntries.join('');
                                            }
                                            reader.readAsText(dbFile);

                                        }, failCB("FileReader"));
                                    }

                                }, fail);

                            }, fail);
                        } catch(e)
                        {
                            
                        }
            
                    }
                    
                    $(IDObjDiv).addClass("centerContent");
                    break;
                case "H": // Implemtenacion del boton HTML.
                    //TO DO
                    var code = ele.data_source_movil;
		            code = code.replace(/~/g, '"');
                    
                    window.sessionStorage.setItem("#TempLabel", Etiqueta);
                    $.globalEval(code);
                    window.sessionStorage.removeItem("#TempLabel");
                    break;
		    }
          //Add extra Evenets.  
            var ActionCode = ele.action_movil + "";
            ActionCode = ActionCode.replace(/~/g,'"');
		    $.globalEval(ActionCode);

		});

		

		window.sessionStorage.setItem("#listOFKeys", listOFKeys);

		var rsTabla = db.SELECT("ListMod", function (row)
		{
			return row.project_id == project_id &&
				   row.object_id == object_id
		});
		
		if (rsTabla.length != 0)
		{
		    $("#lHForma").text(rsTabla[0].formTitle);
		    switch(rsTabla[0].tablaName)
		    {
		        case "vc_finca":
		            $("#btnGeoPos").show();
		            break;
		        case "q_encuesta":
		            
		            $('<input>')
                        .attr(
                        {
                            'id': 'BTN_qEncuesta',
                            'data-role': 'button',
                            'type': 'button',
                            'value': 'Encuesta / Survey',
                            'onclick': 'LoadEncuestaFForm();'
                        })
                        .appendTo("#PageBuilder_From");
		            $('#BTN_qEncuesta').button();
		            break;
		    }
		}
		
		
		$("#PageBuilder_From").show();
		$("#PageBuilder_Lista").hide();
		$("#btnVC_Atras").show();
		$("#btn_backH").hide();
		$("#btnSaveData").show();
		$("#btnNewReg").hide();
	}
}

function LoadEncuestaFForm()
{
    $("body").css("cursor", "wait");
    $("#loadingAJAX").show();
    $("#AJAXLoadLabel").text("Guardando Datos");

    setTimeout(function ()
    {
        window.location = "#EncuentaBuilder";
        CreateListaChequeo(window.sessionStorage.getItem("#P_q_encuesta_formulario$"), window.sessionStorage.getItem("#P_q_encuesta_encuesta$"));

        $("#loadingAJAX").slideUp(500);
        $("#AJAXLoadLabel").text("");
        $("body").css("cursor", "default");
    }, 10);
}

/*
*   funcion para crear, la forma de un reg nuevo.
*/
function BuildFormMobilNewReg(tableName, project_id, object_id, rowID)
{
    window.sessionStorage.setItem("#RowID", rowID);
    window.sessionStorage.setItem("#TableName", tableName);
    window.sessionStorage.setItem("#Project_id", project_id);
    window.sessionStorage.setItem("#Object_id", object_id);
    window.sessionStorage.setItem("#FromMode", "I");

    $(".liHijosHide")
        .addClass("liHijosShow")
        .removeClass("liHijosHide");

    var listOFKeys = [];

    $("#PageBuilder_From").empty();

    var rs = db.SELECT("def_tables_movil", function (row) {
        return row.project_id == project_id &&
				row.object_id == object_id
    });

    var ListKey = GetPrimaryKey(tableName, project_id, object_id);

    //var NextRowID = db.MAX_TABLE(tableName);
    
    var pkJson = window.sessionStorage.getItem("#TableWhere");
    pkJson = JSON.parse(pkJson);
    
    var rsLastReg = db.SELECT(tableName, pkJson).MAX(ListKey[ListKey.length-1]);

    var Max_1 = 0;

    if (rsLastReg > 0) {
        Max_1 = rsLastReg + 1;
    }
    else
        Max_1 = 1;
    
    window.sessionStorage.setItem("#P_" + tableName + "_" + ListKey[ListKey.length - 1] + "$", Max_1);

    var ListPrevPK = JSON.parse(window.sessionStorage.PKID);

    $(ListPrevPK).each(function (i, e)
    {
        window.sessionStorage.setItem("#P_" + tableName + "_" + e.colName + "$", e.id);
    });

    if (rs.length != 0) {
        $jqrs = $(rs);

        var textHtml = "";

        $jqrs.each(function (index, ele)
        {
            var tempID = ele.id_obj + "";
            tempID = tempID.toLowerCase().replace(tableName + "_", "");
            
            var code = ele.initial_value_movil;
            code = code.replace(/~/g, '"');
            $.globalEval(code);

            if (ele.sql_pk == "P") {
                var temp = ele.id_obj + "";
                temp = temp.toLocaleLowerCase();

                if (window.sessionStorage.getItem("#P_" + temp + "$") == null)
                    window.sessionStorage.setItem("#P_" + temp + "$", '');

                listOFKeys.push("#P_" + temp + "$");
            }
            else {
                var temp = ele.id_obj + "";
                temp = temp.toLocaleLowerCase();
                if (window.sessionStorage.getItem("#" + temp + "$") == null)
                    window.sessionStorage.setItem("#" + temp + "$", '');

                listOFKeys.push("#" + temp + "$");
            }

        });

        window.sessionStorage.setItem("#listOFKeys", listOFKeys);

        $jqrs.each(function (index, ele) {
            var tempID = ele.id_obj + "";
            tempID = tempID.toLowerCase().replace(tableName + "_", "");
            var idJQ = '#' + ele.id_obj;

            var DisableVar = (ListKey[ListKey.length - 1] == tempID) ? 'disabled' : null;
            var VisibleVar = (ele.sql_colnum == 0) ? "hidden" : "visible";
            
            var InputValue = window.sessionStorage.getItem(idJQ.toLowerCase() + "$");
            
            var Etiqueta = ele.label;

            if (ele.sql_pk == "P")
            {
                var temp = window.sessionStorage.getItem(idJQ.toLowerCase().replace("#", "#P_") + "$");
                if (temp == null || temp == "")
                    DisableVar = null;
                else
                    DisableVar = 'disabled';
                InputValue = temp;
                
                Etiqueta = "*" + Etiqueta;
            }

            var IDObjDiv = "#" + ele.id_obj + "_div";

            $('<div>')
                .attr({ 'id': ele.id_obj + "_div" })
                .appendTo("#PageBuilder_From");
            if (ele.visible == "N")
                $(IDObjDiv).hide();

            
            
            if (ele.required == 'S')
                Etiqueta = "*" + Etiqueta;
            
		    $('<label>').attr({ 'for': ele.id_obj }).html(Etiqueta).appendTo(IDObjDiv);
            
            switch (ele.content_type) {
                case "D":
                    switch (ele.sql_datatype) {
                        case "IN":
                        case "DE":
                            var tempMaxValue = "";
                            for (var i = 0; i < ele.limit; i++)
                            {
                                tempMaxValue += "9";
                            }
                            
                            $('<input>').attr({ 'type': 'number', 'id': ele.id_obj, 'disabled': DisableVar, 'value': InputValue, 'max': tempMaxValue, 'onblur': 'saveTemVal("#' + ele.id_obj + '", "' + ele.sql_datatype + '");' }).appendTo(IDObjDiv);
                            $(idJQ).textinput();
                            break;
                        case "VA":
                            $('<input>').attr({ 'type': 'text', 'id': ele.id_obj, 'disabled': DisableVar, 'value': InputValue, 'maxlength': ele.limit, 'onblur': 'saveTemVal("#' + ele.id_obj + '", "");' }).appendTo(IDObjDiv);
                            $(idJQ).textinput();
                            break;
                        case "DA":
                        case "DT":
                            $('<input>').attr({ 'type': 'date', 'data-clear-btn': 'true', 'disabled': DisableVar, 'id': ele.id_obj, 'value': InputValue, 'onblur': 'saveTemVal("#' + ele.id_obj + '", "");' }).appendTo(IDObjDiv);
                            $(idJQ).textinput();
                            break;
                    }
                    break;
                case "C":
                    var check = (InputValue == 1) ? true : false;
                    $('<input>').attr({ 'type': 'checkbox', 'id': ele.id_obj, 'disabled': DisableVar, 'onchange': 'saveTemVal("#' + ele.id_obj + '", "CB");', 'checked': check }).appendTo(IDObjDiv);
                    $(idJQ).checkboxradio();
                    break;
                case "B":
                    var tempID = "#" + ele.id_obj;
                    $("<select>").attr({ 'id': ele.id_obj, 'disabled': DisableVar, 'onblur': 'saveTemVal("#' + ele.id_obj + '", "");' }).appendTo(IDObjDiv);
                    $("<option>").attr({ 'value': 'Empty' }).html(ele.label).appendTo(tempID);

                    var listL_S = ele.list_labels + "";
                    var listV_S = ele.list_values + "";

                    listL = listL_S.split(",");
                    listV = listV_S.split(",");

                    $.each(listL, function (i, valor) {
                        if (InputValue == listV[i])
                            $("<option>").attr({ 'value': listV[i], 'selected': 'selected' }).html(valor).appendTo(tempID);
                        else
                            $("<option>").attr({ 'value': listV[i] }).html(valor).appendTo(tempID);
                    });

                    $(idJQ).selectmenu();
                    break;
                case "Q":
                case "E":
                    var tempID = "#" + ele.id_obj;
                    var code = ele.data_source_movil;
                    code = code.replace(/~/g, '"');
                    window.sessionStorage.setItem("#IdElementTep", tempID);
                    window.sessionStorage.setItem("#initValue$", InputValue);
                    window.sessionStorage.setItem("#PKDisable", DisableVar);
                    $.globalEval(code);
                    window.sessionStorage.removeItem("#IdElementTep");
                    window.sessionStorage.removeItem("#initValue$");
                    window.sessionStorage.removeItem("#PKDisable");
                    break;
                case "X":
                    $("<img>")
                        .attr({'id':  ele.id_obj + "_img", 'src':'img/logo.png', 'style':'width: 170px; height: 200px;display: block;margin-left: auto;margin-right: auto'})
                        .appendTo(IDObjDiv);
                    
                    $("#" + ele.id_obj + "_img").on("click", function(e)
                    {
                        var $EleFoto = $(this)
                        tomarFoto(1, function (urlFoto)
                        {
                            getDataUri(urlFoto, 170, 200, function (imgBase64)
                            {
                                $EleFoto.attr('src', "data:image/jpg;base64," + imgBase64);
                                var foto_Linea = "#" + $EleFoto.attr('id').replace("_img", "");

                                var RSmaxFoto = db.SELECT("movil_User", { userName: window.sessionStorage.UserLogin });
                                var maxFoto = RSmaxFoto[0].max_foto;

                                var file = 
                                {
                                    writer: { available: false },
                                    reader: { available: false }
                                }, FileName = "img_" + ((maxFoto * 1) + 1) + ".b64", dbEntries = [];

                                var fail = failCB('requestFileSystem');
                                window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function (fs) 
                                {
                                    var fail = failCB('getFile');
                                    fs.root.getFile(FileName, {create: true, exclusive: false}, function (fileEntry)
                                    {
                                        var fail = failCB('createWriter');
                                        file.entry = fileEntry;

                                        fileEntry.createWriter(function (fileWriter) 
                                        {
                                            file.writer.available = true;
                                            file.writer.object = fileWriter;  

                                            dbEntries.push(imgBase64);
                                            if (file.writer.available) 
                                            {
                                                file.writer.available = false;
                                                file.writer.object.onwriteend = function (evt) 
                                                {
                                                    file.writer.available = true;
                                                    file.writer.object.seek(0);
                                                }
                                                file.writer.object.write(dbEntries.join("\n"));
                                                
                                                ClickEvent_btnSaveData();
                                            }

                                        }, fail);
                                    }, fail);
                                }, fail);

                                db.INSERT_INTO("vc_foto", [
                                {
                                    'linea': (maxFoto * 1) + 1,
                                    'foto_base64': FileName,
                                    'usuario': window.sessionStorage.UserLogin,
                                    'modifica': 1,
                                    'fuente': 2
                                }]);
                                
                                $(foto_Linea).val((maxFoto * 1) + 1);

                                db.UPDATE("movil_User", { max_foto: ((maxFoto * 1) + 1) }, { userName: window.sessionStorage.UserLogin });
                                window.sessionStorage.setItem("UserMaxFoto", ((maxFoto * 1) + 1));
                                
                                
                            });
                        });
                    });
                    
                    $("<input>").attr({'id':  ele.id_obj, 'type': 'hidden', 'value': InputValue}).appendTo(IDObjDiv);
                    
                    $(IDObjDiv).addClass("centerContent");
                    break;
            }
            //$(idJQ).css("visibility", VisibleVar);
            var ActionCode = ele.action_movil + "";
            ActionCode = ActionCode.replace(/~/g,'"');
		    $.globalEval(ActionCode);
        });

        var rsTabla = db.SELECT("ListMod", function (row) {
            return row.project_id == project_id &&
				   row.object_id == object_id
        });

        if (rsTabla.length != 0) {
            $("#lHForma").text(rsTabla[0].formTitle);
            if (rsTabla[0].tablaName == "vc_finca") {
                $("#btnGeoPos").show();
            }
        }


        $("#PageBuilder_From").show();
        $("#PageBuilder_Lista").hide();
        $("#btnVC_Atras").show();
        $("#btn_backH").hide();
        $("#btnSaveData").show();
        $("#btnNewReg").hide();
    }
}

function RemoveSessionVar()
{
    window.sessionStorage.removeItem("#RowID");
    window.sessionStorage.removeItem("#TableName");
    window.sessionStorage.removeItem("#Project_id");
    window.sessionStorage.removeItem("#Object_id");
    window.sessionStorage.removeItem("#FromMode");

    var list_str = window.sessionStorage.getItem("#listOFKeys");

    list_str = list_str + "";

    list_str = list_str.split(",");

    $.each(list_str, function (index, ele) {
        var key = ele + "";
        window.sessionStorage.removeItem(key);
    });

    window.sessionStorage.removeItem("#listOFKeys");

    var listDefaultSV = JSON.parse('[{"key":"UserEmpresa", "val":""},{"key":"UserLogin", "val":""},{"key":"UserName", "val":""},{"key":"UserPais", "val":""},{"key":"UserPromotor", "val":""},{"key":"empresa", "val":""},{"key":"PKID", "val":""},{"key":"#TableWhere", "val":""},{"key":"UserMaxFoto", "val":""},{"key":"GPSLatAnt", "val":""},{"key":"GPSLongAnt", "val":""},{"key":"#History", "val":""}]');

    $(listDefaultSV).each(function (i, e)
    {
        listDefaultSV[i].val = window.sessionStorage.getItem(e.key);
    });

    window.sessionStorage.clear();

    $(listDefaultSV).each(function (i, e)
    {
        window.sessionStorage.setItem(e.key, e.val);
    });

}

function GROUP_BY ( data, col)
{
	var groups = {};

	$.each(data, function(i, ele) 
	{
		var level = ele[col];
	
		delete ele[col];
	
		if(groups[level]) 
		{
			groups[level].push(ele);
		} else 
		{
			groups[level] = [ele];
		}
	});
	
	var result = $.map(groups, function(group, key) 
	{
		var obj = {};
		obj[key] = group;
	
		return obj;
	});
	
	return result;
}

function RefreshIndex()
{
	$("#dMessageNoDB").hide();
	$("#divUlModList").show();
	$("#btnViewCat").show();
	$("#btnUpdateData").show();
	$("#dMessageBDDone").hide();
	$("#btnDBDown").hide();
	$("#btn_NewEncuestaDLG").show();
			
	var rsDos = db.SELECT("Object_Det_Movil", function (row) 
	{
		return row.project_id == 58
	});
	
	if (rsDos.length > 0 )
	{
		var ModAgrupados = GROUP_BY(rsDos, "object_id");
		
		var objID = [];
		
		$.map(ModAgrupados, function (ele, index)
		{
			var key = Object.keys(ele);
			
			objID.push(key[0]);
		});
		
		var rsMods = db.SELECT("Object_Movil", function (row) 
		{
			var idStr = row.object_id + "";
			var res = objID.indexOf(idStr);
			
			return  row.project_id == 58 && 
					row.obj_type == "M";
		});
		
		if (rsMods.length > 0)
		{
			$.each(rsMods, function (index, ele)
			{
				db.UPDATE("ListMod", {padre: 1, obj_order: ele.obj_order}, {project_id: ele.movil_proj, object_id: ele.movil_obj});
			});
		}
		
	}
	
	var rs = db.SELECT("ListMod", function (row)
	{
		return  row.neadForm == 1 && 
				row.padre == 1 
	}).ORDER_BY('obj_order');
	
	if (rs.length > 0)
	{
		$("#ulModList").empty();
		$("#ulModList").listview('refresh');
		$(rs).each(function(index, element) 
		{
			var text = "'" + element.tablaName + "', " +  element.project_id + ", " + element.object_id ;
					
			$("#ulModList").append('<li><a href="#PageBuilder" id="btn'+ element.tablaName +'" onClick="BuildMantenimineto(' + text + ')">'+ element.formTitle +'</a></li>');	
		});
		$("#ulModList").listview('refresh');
	}
	else
	{
		$("#dMessageNoDB").show();
		$("#divUlModList").hide();
		$("#btnDBDown").show();
		$("#btnViewCat").hide();
		$("#btnUpdateData").hide();
		$("#btn_NewEncuestaDLG").hide();
	}
}

function ValidarEditedForm()
{
    var mod = window.sessionStorage.getItem("#FormEdited");
    
    if (mod != undefined || mod != 0)
    {
        Mensage("Campos Modificados")
    }
}

function ClickEvent_btnSaveData()
{
    var rowID = window.sessionStorage.getItem("#RowID");
    var tableName = window.sessionStorage.getItem("#TableName");
    var InsertMode = window.sessionStorage.getItem("#FromMode");
    

    if (rowID != null && tableName != null)
    {
        var rs = db.SELECT("ListMod", function (row) {
            return row.tablaName == tableName
        });

        var defTable = db.DESCRIBE(tableName);
        
        if (rs.length > 0) {
            var pID = rs[0].project_id;
            var oID = rs[0].object_id;

            var rsDef = db.SELECT("def_tables_movil", function (row) {
                return row.project_id == pID &&
                        row.object_id == oID
            });

            var updateArray = "{";

            if (rsDef.length > 0)
            {
                $(rsDef).each(function (index, ele) {
                    var ObjID = ele.id_obj,
                        colName = ObjID.toLowerCase().replace(tableName + "_", ""),
                        InValue = $("#" + ObjID).val(),
                        InputType = $("#" + ObjID).attr('type');
                    
                    if (ele.required == "S" && (InValue == undefined || InValue == null || InValue.trim() == "Empty" || InValue.trim() == ""))
                    {
                        Mensage("El campo '" + ele.label + "' Es requerido. / The field '" + ele.label + "' is required.");
                        throw "El campo '" + ele.label + "' Es requerido.";
                    }
                    
                                        
                    if (ele.sql_pk == "P" && (InValue == undefined || InValue == null || InValue.trim() == "Empty" || InValue.trim() == ""))
                    {
                        var bakInitVal = window.sessionStorage.getItem("#P_" + ObjID.toLowerCase() + "$");
                        
                        
                        bakInitVal = (bakInitVal == "")?null:bakInitVal;
                        bakInitVal = (bakInitVal == "-1")?null:bakInitVal;
                        
                        if (bakInitVal != null )
                            InValue = bakInitVal;
                        else
                        {
                            Mensage("El campo '" + ele.label + "' Es requerido. / The field '" + ele.label + "' is required.");
                            throw "El campo '" + ele.label + "' Es requerido.";  
                        }
                    }

                    if (InputType == "checkbox")
                    {
                        InValue = $("#" + ObjID).is(":checked") ? 1 : 0;
                    }

                    if (colName == "usuario")
                        updateArray += '"usuario": "' + window.sessionStorage.getItem("UserLogin") + '", ';
                    else
                    {
                        if (typeof defTable[colName] == 'number')
                        {
                            InValue = ((InValue == undefined) ? null : InValue * 1);
                            updateArray += '"' + colName + '": ' + ((InValue == NaN) ? null : InValue) + ', ';
                        }
                        else
                            updateArray += '"' + colName + '": "' + ((InValue == undefined) ? null : InValue) + '", ';
                    }
                });

                updateArray += "}";

                if (InsertMode == "I")
                {
                    var NextRowID = db.MAX_TABLE(tableName);
                    window.sessionStorage.setItem("#RowID", NextRowID);

                    updateArray = updateArray.replace(", }", ', "fuente": 2, "modifica": 1, "sinc": 0, "usuario": "' + window.sessionStorage.getItem("UserLogin") + '"}');

                    updateArray = updateArray.replace(/NaN/g, "null");

                    var InssertArray = updateArray.replace("{", "[{").replace("}", "}]");

                    db.INSERT_INTO(tableName, JSON.parse(InssertArray));

                    window.sessionStorage.setItem("#FromMode", "U");

                    if (tableName == "q_encuesta") 
                    {
                        var arrColl = ["empresa", "formulario", "grupo", "pregunta", "accion_correctiva"];

                        var triggerRS = db.SELECT("q_pregunta", function (row) {
                            return row.empresa == window.sessionStorage.getItem("UserEmpresa")
                            && row.formulario == window.sessionStorage.getItem("#P_q_encuesta_formulario$");
                        });

                        if (triggerRS.length > 0) {

                            var SetToInsert = [];
                            var SelectToInsert = {};
                            $(triggerRS).each(function (i, e) {
                                $.each(arrColl, function (j, val) {
                                    SelectToInsert[val] = e[val];
                                });

                                SelectToInsert["encuesta"] = window.sessionStorage.getItem("#P_q_encuesta_encuesta$") * 1;
                                SelectToInsert["fuente"] = 2;
                                SelectToInsert["sinc"] = 0;
                                SelectToInsert["modifica"] = 0;
                                SelectToInsert["usuario"] = window.sessionStorage.getItem("UserLogin") + "";

                                SetToInsert.push(SelectToInsert);
                                SelectToInsert = {};
                            });

                            db.INSERT_INTO("q_respuesta", SetToInsert);
                        }
                    }
                    else
                    {
                        rowID = window.sessionStorage.getItem("#RowID");

                        //if (window.sessionStorage.getItem("#SiMSG") != "1")
                        
                        $("#btnVC_Atras").trigger("click");
                        BuildFormMobil(tableName, pID, oID, rowID);   
                    }
                }
                else
                {
                    updateArray = updateArray.replace(", }", ', "modifica": 1, "sinc": 0, "usuario": "' + window.sessionStorage.getItem("UserLogin") + '"}');
                    updateArray = updateArray.replace(/NaN/g, "null");
                    db.UPDATE(tableName, JSON.parse(updateArray), { id: rowID });
                }

                var IdListMod = rs[0].id;
                db.UPDATE("ListMod", { sinc: 1 }, { id: IdListMod });

                //if (window.sessionStorage.getItem("#SiMSG") != "1")
                
                var texto = $("#lDatosSave").text();
                
                Mensage(texto);
                window.sessionStorage.removeItem("#SiMSG");
                

                
            }


        }
    }
}

function ClickEvent_btnGeoPos()
{
    navigator.geolocation.getCurrentPosition(onSuccess, onError);
}

function ClickEvent_btn_backH()
{
    if (!window.sessionStorage.getItem("#History"))
    {
        window.location = '#IndexPage';
        RemoveSessionVar();
        location.reload();
    }

    var ObjHist = JSON.parse(window.sessionStorage.getItem("#History"));

    var LastObj = ObjHist[ObjHist.length - 2];

    var tableName = LastObj.path + "";
    tableName = tableName.split("/");

    tableName = tableName[tableName.length - 1].toString();

    if (tableName == "root")
    {
        window.location = '#IndexPage';
        RemoveSessionVar();
        location.reload();
    }
    else
    {
        ObjHist.pop();
        window.sessionStorage.setItem("#History", JSON.stringify(ObjHist));
        BuildMantenimineto(tableName, LastObj.pID, LastObj.oID);
    }


}

function ClickEvent_btnNewReg(tableName, project_id, object_id)
{
    BuildFormMobilNewReg(tableName, project_id, object_id, 0);
}

// on Create events 

var onSuccessGPSPormotor = function (position)
{
    var GPSLong = position.coords.longitude;
    var GPSLat = position.coords.latitude;
    var GPSAlti = position.coords.altitude;

    var GpsLatAnt = window.sessionStorage.GPSLatAnt;
    var GpsLonAnt = window.sessionStorage.GPSLongAnt;

    GpsLatAnt = (GpsLatAnt == undefined || GpsLatAnt == "null") ? 0 : GpsLatAnt;
    GpsLonAnt = (GpsLonAnt == undefined || GpsLonAnt == "null") ? 0 : GpsLonAnt;

    var difLong = Math.abs(Math.abs(GPSLong * 1) - Math.abs(GpsLonAnt * 1));
    var difLat = Math.abs(Math.abs(GPSLat * 1) - Math.abs(GpsLatAnt * 1));

    if (difLong > 0.0001 && difLat > 0.0001)
    {
        var maxLinea = db.SELECT("promotor_gps", { empresa: window.sessionStorage.UserEmpresa, promotor: window.sessionStorage.UserPromotor }).MAX("linea");

        maxLinea = (maxLinea == null) ? 1 : maxLinea + 1;

        var fechaGps = new Date(position.timestamp);
        var fechaSys = new Date();
        var setData =
            [{
                'fuente': 2,
                'modifica': 1,
                'empresa': (window.sessionStorage.UserEmpresa * 1),
                'promotor': (window.sessionStorage.UserPromotor * 1),
                'linea': maxLinea,
                'gps_latitud': GPSLat,
                'gps_longitud': GPSLong,
                'gps_altitud': GPSAlti,
                'fecha_gps': fechaGps.getFullYear() + "-" + (fechaGps.getMonth() + 1) + "-" + fechaGps.getDate() + " " +
                    fechaGps.getHours() + ":" + fechaGps.getMinutes() + ":" + fechaGps.getSeconds(),
                'fecha_sistema': fechaSys.getFullYear() + "-" + (fechaSys.getMonth() + 1) + "-" + fechaSys.getDate(),
                'usuario': window.sessionStorage.getItem("UserLogin")
            }];

        db.INSERT_INTO("promotor_gps", setData);
        GpsLonAnt = GPSLong;
        GpsLatAnt = GPSLat;

        window.sessionStorage.GPSLatAnt = GPSLat;
        window.sessionStorage.GPSLongAnt = GPSLong;
    }
};

function onFaliProdGPS(error)
{
    $(".GPS_Alert").slideDown(500).delay(5000).slideUp(500);
}

function valLeng()
{
    if (window.localStorage.getItem("$en-us%") == "ENG")
    {
        var listOfOBJS = ["#pMenu h2:first-child", "#btnUpdateData", "#btnLogOut","#btn_NewEncuestaDLG", "#btnDownloadPhoto", "#btnVerPhoto", "#lUserEmpresa", "#lUserName", "#IndexPage div[data-role='header'] h1", "#ulSideMenu h2:first-child", "#btnDBDown", "#ldMessageNoDB", "#btnLoadModules", "#btn_Home", "#btnGeoPos", "#lHEncuestaB", "#DLGEncuesta div[data-role='header'] h1", "label[for='Q_ENCUESTA_FORMULARIO']", "label[for='Q_ENCUESTA_PRODUCTOR']", "label[for='Q_ENCUESTA_FINCA']", "label[for='Q_ENCUESTA_ENCUESTA']", "label[for='Q_ENCUESTA_COSECHA']","label[for='Q_ENCUESTA_FECHA']", "label[for='Q_ENCUESTA_NOTA']", "#btn_CrearEncuestaSC", "#Texto1", "#tErrorLogin", "#tLogIn", "#tNoInternet", "#lLoading", "#msgDropDB", "#msgSendData", "#msgErrortabel", "#msgCerrarSecion", "#lModoData", "#lEncuestaSeve", "#lDatosSave", "#lConfProdDel", "#lConfProdDes", "#lMensDel", "#lMensDes", "#btnGruposDWL", "#DLGDownload div[data-role='header'] h1"];

        $(listOfOBJS).each(function(i, val)
        {
            var lab = "label" + (i + 1);

            $(val)._t(lab);
        });
        
        $("#btnTraslate").addClass("ui-icon-esLogo").removeClass("ui-icon-enLogo");
    }
}

function downLoadProsses ()
{
    try
    {
        if (window.sessionStorage.UserEmpresa)
        {
            db.TRUNCATE('Object_Movil');
            db.TRUNCATE('Object_Det_Movil');

            $.post(uriServer,
            {
                "cmd": "ListModules",
                "Project": 58,
                "User": window.sessionStorage.UserLogin
            },
            function (data) {
                $("#loadingAJAX").show();

                maxTrans = 0;
                DownCount = 0;

                db.INSERT_INTO("Object_Movil", data.ObjServer);
                db.INSERT_INTO("Object_Det_Movil", data.ObjDetServer);

                var rs = db.SELECT("Object_Movil");

                if (rs.length > 0) {
                    var $jqRS = $(rs);

                    $jqRS.each(function (index, ele) {

                        DownLoadDataSave(ele.movil_proj, ele.movil_obj, "", ele.tableName, 1, ele.formName);
                    });
                }

                //DownLoadDataSave(55, 91, "", "UNIDAD_MEDIDA", 0, ""); 
                DownLoadDataSave(55, 82, "", "PAIS", 0, "");
                DownLoadDataSave(55, 83, "", "DEPARTAMENTO", 0, "");
                DownLoadDataSave(55, 84, "", "CIUDAD", 0, "");
                DownLoadDataSave(55, 45, "", "VC_VARIEDAD", 0, "");
                //DownLoadDataSave(55, 100, "", "VC_ACTIVIDAD_PROMOTOR", 0, "");


            }, "json")
                .fail(function (qXHR, textStatus, errorThrown) {
                    Mensage("No Conexion. / No Connection");
                    //Mensage(qXHR.responseText);
                    console.log(qXHR);
                    console.log(textStatus);
                    console.log(errorThrown);
                });

        }
        else {
            window.location = "#LogInDialog";
        }
    }
    catch (Error)
    {
        Mensage(Error);
    }
}

$(document).ready(function (e) 
{
    $(".GPS_Alert").show();
    $(".GPS_Alert").slideUp(500);
    
    var TimeGpsInterval = 60 * 1000;//3600 * 1000;

    var idGPSTRack = setInterval(function ()
    {
        if (window.sessionStorage.UserPromotor && db.EXISTS_TABLE("promotor_gps"))
            navigator.geolocation.getCurrentPosition(onSuccessGPSPormotor,onFaliProdGPS);
    }, TimeGpsInterval);

    if (window.localStorage.getItem("LocalStorageDB-KannelMovil-::tables::") == undefined) {
        CreateDB("KannelMovil");
    }
    else 
    {
        db = new LocalStorageDB("KannelMovil");
        
        var rs = db.SELECT("movil_User", {keeplogin: 1});

        if (rs.length > 0)
        {
            var lastItem = rs.length - 1;

            window.sessionStorage.setItem("UserLogin",rs[lastItem].userName);
            window.sessionStorage.setItem("UserPais",rs[lastItem].userPais);
            window.sessionStorage.setItem("UserEmpresa",rs[lastItem].Empresa);
            window.sessionStorage.setItem("UserPromotor",rs[lastItem].userPromotor);
            window.sessionStorage.setItem("UserMaxFoto",rs[lastItem].max_foto);
        }
    }

    $("#loadingAJAX").width(window.innerWidth);
    $("#loadingAJAX").height(window.innerHeight);

    $("#ajaxgif").css(
	{
	    top: ((window.innerHeight / 2) - 80),
	    left: ((window.innerWidth / 2) - 40)
	});

    $("#btnTraslate").click(function (event) {
        if (window.localStorage.getItem("$en-us%") == "ENG")
        {
            window.localStorage.removeItem("$en-us%");
        }
        else
        {
            window.localStorage.setItem("$en-us%", "ENG");
        }
        
        location.reload();

    });

    var listaOb = ["#Texto1", "#tErrorLogin", "#tLogIn", "#tNoInternet", "#lLoading", "#lNoData", "#msgDropDB", "#msgSendData", "#msgDBSincOK", "#msgErrortabel", "#msgCerrarSecion", "#lModoData", "#lEncuestaSeve", "#lDatosSave", "#lConfProdDel", "#lConfProdDes", "#lMensDel", "#lMensDes"];

    $("#loadingAJAX").hide();

    $.each(listaOb, function (index, val) {
        $(val).hide();
    });

    if (window.sessionStorage.UserEmpresa)
    {
        window.location = "#IndexPage";
    }
    else
    {
        window.location = "#page-home";
    }
    
    valLeng();
    
    
    
    
});

document.addEventListener('deviceready', function () {

    // Android customization
    // To indicate that the app is executing tasks in background and being paused would disrupt the user.
    // The plug-in has to create a notification while in background - like a download progress bar.
    cordova.plugins.backgroundMode.setDefaults({ 
        title:  'TheTitleOfYourProcess',
        text:   'Executing background tasks.'
    });

    // Enable background mode
    cordova.plugins.backgroundMode.enable();

    // Called when background mode has been activated
    cordova.plugins.backgroundMode.onactivate = function () 
    {
        var idSendGSPtoServer = setInterval(SendGPS2Server(), (60 * 1000) + 5000);
        cordova.plugins.backgroundMode.configure({
                text:'Volcafe App...'
            });
    }
}, false);

$(document).on("pagecreate", "#IndexPage", function() 
{
   
    RemoveSessionVar();

    window.sessionStorage.setItem("#History", JSON.stringify([{ 'path': 'root', 'pID': 0, 'oID': 0, 'Where': "", 'rowID': 0 }]));

    if (window.sessionStorage.UserLogin && window.sessionStorage.UserPromotor)
    {
       
        $("#lUserEmpresa_val").text(": " + window.sessionStorage.UserEmpresa);
        $("#lUserName_val").text(": " + window.sessionStorage.UserLogin + "(" + window.sessionStorage.UserPromotor + ")");
		
        window.sessionStorage.setItem("empresa", window.sessionStorage.UserEmpresa);
	
        $("#dMessageNoDB").hide();
        $("#divUlModList").show();
        $("#btnViewCat").show();
        $("#btnUpdateData").show();
        $("#dMessageBDDone").hide();
        $("#btn_NewEncuestaDLG").show();

        $("#btnLogOut").click(function (e)
        {
            var txtMsg = $("#msgCerrarSecion").text();

		    new Messi(txtMsg,
				{
				    title: 'Volcafe Way',
				    titleClass: 'anim warning',
				    buttons:
						[
							{ id: 0, label: 'Yes', val: 'Y' },
							{ id: 1, label: 'Cancel', val: 'C' }
						],
				    modal: true,
				    width: (window.innerWidth - 25),
				    callback: function (val)
				    {
				        if (val == 'Y')
                        {   var usertemp = window.sessionStorage.getItem("UserLogin");
                            window.sessionStorage.clear();
                            window.location = "#page-home";
                            //db.UPDATE("movil_User", {keeplogin: 0}, {userName: usertemp});
                            db.TRUNCATE("movil_User");
                        }
				    }
				});
           
            
        });
        
        $("#btnDBDown").click(function(e) 
        {
            getGruposProd();
        });
		
		$("#btnLoadModules").click(function(e) 
		{
         	RefreshIndex();  
            //ReDowloadFoto();
		});

		$("#btnUpdateData").click(function (e)
		{
		    var txtMsg = $("#msgSendData").text();

		    new Messi(txtMsg,
				{
				    title: 'Volcafe Way',
				    titleClass: 'anim success',
				    buttons:
						[
							{ id: 0, label: 'OK', val: 'Y' },
							{ id: 1, label: 'Cancel', val: 'C' }
						],
				    modal: true,
				    width: (window.innerWidth - 25),
				    callback: function (val)
				    {
				        if (val == 'Y')
				            SendData2DB();
				    }
				});
		});
		
		$("#btnViewCat").click(function (e)
		{
			var txtMsg = $("#msgDropDB").text();
			new Messi(txtMsg, 
				{
					title: 'Volcafe Way', 
					titleClass: 'anim warning', 
					buttons: 
						[
							{id: 0, label: 'Drop DB', val: 'Y', class: 'btn-danger'},
							{id: 1, label: 'Cancel', val: 'C' }
						],
					modal: true,
					width: (window.innerWidth - 25),
					callback: function(val) 
					{
						if (val == 'Y')
						 DropDataBase("KannelMovil");
					}
				});
			
		});
		
		RefreshIndex();
		
	}
	else
	{
		window.location = "#LogInDialog";
	}
});

$(document).on("pagecreate", "#GridCatalog", function () 
{
    $("#FBuscarCat").show();
    $("#FGrid").hide();

    $("#btnFBuscar").click(function () {
        var tableName = $("#tbFBuscar").val();

        var rs;

        try {
            rs = db.SELECT(tableName);

            if (rs.length == 0) {
                var txtMsg = $("#lNoData").text();
                new Messi(txtMsg,
						{
						    title: 'Volcafe Way',
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
            else {
                $("#FGrid_Tabla").empty();
                $("#FGrid_Tabla").append("<thead></thead><tbody></tbody>");
                $("#FBuscarCat").hide();
                $("#FGrid").show();

                $(rs).each(function (index, element) {


                });
            }
        }
        catch (err) {
            Mensage(err.message);
        }
    });
});

$(document).on("pagecreate", "#PageBuilder", function ()
{
    $("#btnVC_Atras").click(function ()
    {
        $("#PageBuilder_Lista").show();
        $("#PageBuilder_From").hide();
        $("#btnVC_Atras").hide();
        $("#btn_backH").show();
        $("#btnSaveData").hide();
        $("#btnGeoPos").hide();
        $("#btnNewReg").show();

        var pID = window.sessionStorage.getItem("#Project_id");
        var oID = window.sessionStorage.getItem("#Object_id");

        window.sessionStorage.setItem("#tf$", "1");
        DataGrid(window.sessionStorage.getItem("#TableName"),
            pID,
            oID,
            JSON.parse(window.sessionStorage.getItem("#TableWhere")));

        window.sessionStorage.removeItem("#RowID");
        window.sessionStorage.removeItem("#TableName");
        window.sessionStorage.removeItem("#Project_id");
        window.sessionStorage.removeItem("#Object_id");
        RemoveSessionVar();

        $(".liHijosShow")
            .addClass("liHijosHide")
            .removeClass("liHijosShow");
    });

});

$(document).on("pagecreate", "#page-home", function ()
{
    try
    {
        if (db != undefined)
        {
            var rs = db.SELECT("movil_User", {keeplogin: 1});

            if (rs.length > 0)
            {
                var lastItem = rs.length - 1;

                window.sessionStorage.setItem("UserLogin",rs[lastItem].userName);
                window.sessionStorage.setItem("UserPais",rs[lastItem].userPais);
                window.sessionStorage.setItem("UserEmpresa",rs[lastItem].Empresa);
                window.sessionStorage.setItem("UserPromotor",rs[lastItem].userPromotor);
                window.sessionStorage.setItem("UserMaxFoto",rs[lastItem].max_foto);
            }
        }
    }
    finally
    {
        var empresa = window.sessionStorage.getItem("UserLogin");
        var userName = window.sessionStorage.getItem("UserEmpresa");

        if (empresa != null && userName != null)
        {
            window.location = "#IndexPage";
        }
    }
    
    
    
});

$(document).on("pagecreate", "#pGaleriaFotos", function()
{
    var rs = db.SELECT("vc_foto");
    
    if (rs.length > 0)
    {
        $(rs).each(function(i, ele)
        {
            $('<fieldset>')
                .attr({ 'data-role': 'collapsible', 'id': 'foto_' + ele.linea })
                .html('<legend> Photo #' + ele.linea + ' - ' + ele.foto_base64 + '</legend>')
                .appendTo("#GF_set");
            
            var tempID = "#foto_" + ele.linea;
            
            $('<div>').attr({'class':"centerContent", 'id': 'div_foto' + ele.linea}).appendTo(tempID);
            
            var fail = failCB('requestFileSystem');
            window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function (fs) 
            {
                var fail = failCB('getFile');
                var file = 
                        {
                            writer: { available: false },
                            reader: { available: false }
                        }, dbEntries = [], FileName = ele.foto_base64;
                
                fs.root.getFile(FileName , {create: true, exclusive: false}, function (fileEntry)
                {
                    var fail = failCB('createWriter');
                    file.entry = fileEntry;
                    
                    if (file.entry) 
                    {
                        file.entry.file(function (dbFile) 
                        {
                            var reader = new FileReader();
                            reader.onloadend = function (evt) 
                            {
                                var textArray = evt.target.result.split("\n");
                                
                                dbEntries = textArray.concat(dbEntries);
                                $('<label>').html(dbEntries[0].length + " - " + ele.foto_base64 ).appendTo("#div_foto" + ele.linea);
                                $('<img>')
                                    .attr({'src': "data:image/jpg;base64," + dbEntries[0]})
                                    .appendTo("#div_foto" + ele.linea);
                                //$('definitions').innerHTML = dbEntries.join('');
                            }
                            reader.readAsText(dbFile);
                            
                        }, failCB("FileReader"));
                    }
                     
                }, fail);
                
            }, fail);
            
            
            
            /*$('<img>')
                .attr({'src': "data:image/jpg;base64," + ele.foto_base64})
                .appendTo("#div_foto" + ele.linea);*/
            
             $(tempID).collapsible();
            
            
        });
    }
});

$.mobile.document
    .on( "listviewcreate", "#Q_ENCUESTA_PRODUCTOR-menu", function( e ) {
        var input,
            listbox = $( "#Q_ENCUESTA_PRODUCTOR-listbox" ),
            form = listbox.jqmData( "filter-form" ),
            listview = $( e.target );
        // We store the generated form in a variable attached to the popup so we
        // avoid creating a second form/input field when the listview is
        // destroyed/rebuilt during a refresh.
        if ( !form ) {
            input = $( "<input data-type='search'></input>" );
            form = $( "<form></form>" ).append( input );
            input.textinput();
            $( "#Q_ENCUESTA_PRODUCTOR-listbox" )
                .prepend( form )
                .jqmData( "filter-form", form );
        }
        // Instantiate a filterable widget on the newly created listview and
        // indicate that the generated input is to be used for the filtering.
        listview.filterable({ input: input });
    })
    .on( "pagebeforeshow pagehide", "#Q_ENCUESTA_PRODUCTOR-dialog", function( e ) {
    
        $(this).addClass("ui-page-theme-b").removeClass("ui-page-theme-a");
        
        var form = $( "#Q_ENCUESTA_PRODUCTOR-listbox" ).jqmData( "filter-form" ),
            placeInDialog = ( e.type === "pagebeforeshow" ),
            destination = placeInDialog ? $( e.target ).find( ".ui-content" ) : $( "#Q_ENCUESTA_PRODUCTOR-listbox" );
        form
            .find( "input" )
            // Turn off the "inset" option when the filter input is inside a dialog
            // and turn it back on when it is placed back inside the popup, because
            // it looks better that way.
            .textinput( "option", "inset", !placeInDialog )
            .end()
            .prependTo( destination );
    
        $(".ui-body-a").addClass("ui-body-b").removeClass("ui-body-a");
    });


