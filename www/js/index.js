var db;
var uriServer = "http://200.30.150.165:8080/webservidor2/mediador.php";
var maxTrans = 0;
var DownCount = 0;
var failTablesList = "";



var onSuccess = function (position) {

    'use strict'
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

function onError(error) {
    Mensage('code: ' + error.code + '\n' +
          'message: ' + error.message + '\n');
}

function Mensage(texto) {
    /*$("#loadingAJAX").show();
	$("#ajaxgif").hide();*/
    new Messi(texto,
	{
	    title: 'Kannel Mobil',
	    width: (window.innerWidth - 25),
        modal: true,
	    callback: function (val) {
	        alert(val);
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
            visible: ''
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
		    max_foto: 0
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
				
				var defData = '{ "id": 0, "fuente": 0, "sinc": 0, "modifica": 0, ';
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
			
				db.CREATE(TableName, objdefData);

				maxTrans++;

				$.post("http://200.30.150.165:8080/webservidor2/mediador.php", 
				{
					"cmd"		: "xmlData",
					"Project"	: Project_Id,
					"Object"	: Object_Id,
					"empresa": window.sessionStorage.getItem("UserEmpresa"),
					"usrCode": window.sessionStorage.getItem("UserPromotor"),
					"usrPais": window.sessionStorage.getItem("UserPais")
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
					
					objDataInsert = JSON.parse(DataInsert);

					$("#AJAXLoadLabel").text("Descarga... " + (++DownCount) + " [" + TableName + "] " + " de " + maxTrans);
					
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
                                title: 'Kannel Mobil',
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
					        $("#loadingAJAX").delay(2000).slideUp(500);
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
                                title: 'Kannel Mobil',
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
    
    var tempPws = "";

    if (rs.length > 0)
    {
        tempPws = rs[0].passWord;
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
                max_foto: window.sessionStorage.UserMaxFoto
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
        });

    }
    else
        callback(strCB);
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
    if (rs.length > 0)
    {
        $(rs).each(function (index, ele)
        {
            var rsData = db.SELECT(ele.tablaName, { modifica: 1, sinc: 0 });
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
                        if (e[val] == "" || e[val] == null || e[val] == undefined)
                            delete e[val];
                    });
                    
                    TempData.push(e);
                });

                var info = {
                    "tablaName": ele.tablaName,
                    "project_id": ele.project_id,
                    "object_id": ele.object_id,
                    "data": TempData
                };

                ListTables.push(info);
            }
        });
        var empresaVal = window.sessionStorage.getItem("UserEmpresa");
        var usrVal = window.sessionStorage.getItem("UserLogin");
        var payload = { "User": usrVal, "Empresa": empresaVal, "cmd": "SendDataFormMovil", "Data": ListTables };

        if (ListTables.length > 0)
            $.post("http://200.30.150.165:8080/webservidor2/mediador.php", payload,
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
            Mensage("No Datos Modificados.");
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
    window.sessionStorage.setItem("#HijoKannel", "1");
    BuildMantenimineto(tableName, proj_Id, obj_Id);
    window.sessionStorage.removeItem("#HijoKannel");
    RemoveSessionVar();
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
            '<li><a class="ui-btn ui-shadow ui-icon-home ui-btn-icon-left" href="#IndexPage" onClick="' + temptextOn + '">Inicio</a></li>' +
            '<li><a href="#PageBuilder" data-rel="close" id="btnSaveData" class="ui-btn ui-shadow ui-icon-check ui-btn-icon-left" onclick="ClickEvent_btnSaveData();" >Guardar</a></li>' +
            '<li><a href="#PageBuilder" data-rel="close" id="btnNewReg" class="ui-btn ui-shadow ui-icon-plus ui-btn-icon-left" onclick="ClickEvent_btnNewReg(' + NewRegParams + ')">Nuevo</a></li>' +
            '<li><a href="#PageBuilder" data-rel="close" id="btnGeoPos" class="ui-btn ui-shadow ui-icon-location ui-btn-icon-left" onclick="ClickEvent_btnGeoPos();">Obtener GPS</a></li>'
        );

	

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
	    $("#btnNewReg").show();

	    window.sessionStorage.removeItem("#RowID");
	    window.sessionStorage.removeItem("#TableName");
	    window.sessionStorage.removeItem("#Project_id");
	    window.sessionStorage.removeItem("#Object_id");
	    RemoveSessionVar();

	    $(".liHijosShow")
            .addClass("liHijosHide")
            .removeClass("liHijosShow");
	}
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

function DataGrid(tableName, proj_Id, obj_Id, Owhere)
{
    var ComeFForm = window.sessionStorage.getItem("#tf$");
    window.sessionStorage.removeItem("#tf$");
    window.sessionStorage.setItem("#TableWhere", JSON.stringify(Owhere));

    $("#PageBuilder_Lista").empty();
    $('<form>').html('<input id="filterTable-inpu2t" data-type="search">').appendTo("#PageBuilder_Lista");
    $("#filterTable-inpu2t").textinput();
    $('<table>').attr({ 'id': 'PageBuilder_Tabla', 'data-role': 'table', 'class': 'ui-responsive table-stroke', 'data-filter': 'true', 'data-input': '#filterTable-inpu2t' }).appendTo("#PageBuilder_Lista");
    $('<thead>').html('<tr><th >Ver...</th></tr>').appendTo("#PageBuilder_Tabla");
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
				
		var DataRs = db.SELECT(tableName, Owhere).LIMIT(1000); // max Data to display
		
		if (DataRs.length > 0)
		{
		    var $jqDataRS = $(DataRs);

		    var rowCont = 0;
		    $jqDataRS.each(function (index, element)
		    {
		        rowCont++;

		        var tempID = "row_" + index;

		        $('<tr>').attr({ 'id': tempID }).appendTo("#PageBuilder_Tabla tbody");

		        var params = '"' + tableName + '", ' + proj_Id + ", " + obj_Id + ", " + element.id;

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
                    .html("<a class='btnVer ui-btn ui-shadow ui-corner-all ui-icon-action ui-btn-icon-notext ui-btn-a' data-transition='slide' href='#PageBuilder' onclick='BuildFormMobil(" + params + ")' >Ir.</a>")
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
		    $("#btn_Home").trigger("click");
		}
		
		$("#PageBuilder_From").hide();
		$("#PageBuilder_Tabla").show();
		$("#btnVC_Atras").hide();
		$("#btn_backH").show();
		$("#btnSaveData").hide();
		$("#btnNewReg").show();
		$("#btnGeoPos").hide();

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

            $('select').selectmenu();
        }
    }
}

function CQDRefreshForm(idObj, tableName, project_id, object_id, rowID)
{
    saveTemVal("#" + idObj, "");
    window.sessionStorage.setItem("#SiMSG", "1");
    $("#btnSaveData").trigger("click");

    if (window.sessionStorage.getItem("#FromMode") == "I")
        rowID = window.sessionStorage.getItem("#RowID");

    $("#btnVC_Atras").trigger("click");
    BuildFormMobil(tableName, project_id, object_id, rowID);
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

		    if (ele.sql_pk == "P")
		    {
		        disableVar = 'disabled';

		        var temp = ele.id_obj + "";
		        temp = temp.toLocaleLowerCase();
		        window.sessionStorage.setItem("#P_" + temp + "$", InputValue);

		        listOFKeys.push("#P_" + temp + "$");
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

		    $('<label>').attr({ 'for': ele.id_obj }).html(ele.label).appendTo(IDObjDiv);

		    switch (ele.content_type)
		    {
		        case "D":
		            switch (ele.sql_datatype) {
		                case "IN":
		                case "DE":
		                    $('<input>')
                                .attr({ 'type': 'number', 'id': ele.id_obj, 'disabled': disableVar, 'value': InputValue, 'onblur': 'saveTemVal("#' + ele.id_obj + '", "' + ele.sql_datatype + '");' })
                                .appendTo(IDObjDiv);
		                    
		                    $(idJQ).textinput();
		                    break;
		                case "VA":
		                    $('<input>')
                                .attr({ 'type': 'text', 'id': ele.id_obj, 'disabled': disableVar, 'value': InputValue, 'onblur': 'saveTemVal("#' + ele.id_obj + '", "");' })
                                .appendTo(IDObjDiv);
		                    
		                    $(idJQ).textinput();
		                    break;
		                case "DA":
		                case "DT":
		                    InputValue = InputValue + "";

		                    var FechaSplit = InputValue.split("-");
		                    if (FechaSplit.length > 0 && FechaSplit[0].length == 2)
		                    {
		                        var Dia = FechaSplit[0] * 1;
		                        var Mes = (FechaSplit[1] * 1) - 1;
		                        var Anio = (FechaSplit[2] * 1);

		                        Anio = Anio < 2000 ? Anio + 2000 : Anio;

		                        var fecha = new Date(Anio, Mes, Dia);
                                
		                        InputValue = fecha.getFullYear() + "-" + pad((fecha.getMonth() + 1) + "",2) + "-" + fecha.getDate();
		                    }

                            
		                    $('<input>')
                                .attr({ 'type': 'date', 'data-clear-btn': 'true', 'disabled': disableVar, 'id': ele.id_obj, 'value': InputValue, 'onblur': 'saveTemVal("#' + ele.id_obj + '", "");' })
                                .appendTo(IDObjDiv);
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
		    }

		   

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
                            'value': 'Encuesta',
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

    var NextRowID = db.MAX_TABLE(tableName);
    
    var rsLastReg = db.SELECT(tableName, { id: NextRowID - 1 });

    var Max_1 = 0;

    if (rsLastReg.length > 0) {
        Max_1 = (rsLastReg[0][ListKey[ListKey.length - 1]] * 1) + 1;
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

            if (ele.sql_pk == "P")
            {
                var temp = window.sessionStorage.getItem(idJQ.toLowerCase().replace("#", "#P_") + "$");
                if (temp == null || temp == "")
                    DisableVar = null;
                else
                    DisableVar = 'disabled';
                InputValue = temp;
            }

            var IDObjDiv = "#" + ele.id_obj + "_div";

            $('<div>')
                .attr({ 'id': ele.id_obj + "_div" })
                .appendTo("#PageBuilder_From");
            if (ele.visible == "N")
                $(IDObjDiv).hide();

            $('<label>').attr({ 'for': ele.id_obj }).html(ele.label).appendTo(IDObjDiv);
            switch (ele.content_type) {
                case "D":
                    switch (ele.sql_datatype) {
                        case "IN":
                        case "DE":
                            $('<input>').attr({ 'type': 'number', 'id': ele.id_obj, 'disabled': DisableVar, 'value': InputValue, 'onblur': 'saveTemVal("#' + ele.id_obj + '", "' + ele.sql_datatype + '");' }).appendTo(IDObjDiv);
                            $(idJQ).textinput();
                            break;
                        case "VA":
                            $('<input>').attr({ 'type': 'text', 'id': ele.id_obj, 'disabled': DisableVar, 'value': InputValue, 'onblur': 'saveTemVal("#' + ele.id_obj + '", "");' }).appendTo(IDObjDiv);
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
            }
            //$(idJQ).css("visibility", VisibleVar);
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
                    
                    if (ele.sql_pk == "P" && (InValue == undefined || InValue == null || InValue.trim() == "Empty"))
                    {
                        Mensage("El campo '" + ele.label + "' Es requerido.");
                        throw "El campo '" + ele.label + "' Es requerido.";
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

                    //window.sessionStorage.setItem("#FromMode", "U");

                    if (tableName == "q_encuesta") {
                        var arrColl = ["empresa", "formulario", "grupo", "pregunta"];

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

                        if (window.sessionStorage.getItem("#SiMSG") != "1")
                        {
                            $("#btnVC_Atras").trigger("click");
                            BuildFormMobil(tableName, pID, oID, rowID);   
                        }
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

                if (window.sessionStorage.getItem("#SiMSG") != "1")
                {
                    Mensage('Datos Guardados...');
                    window.sessionStorage.removeItem("#SiMSG");
                }

                
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

    GpsLatAnt = GpsLatAnt == undefined ? 0 : GpsLatAnt;
    GpsLonAnt = GpsLonAnt == undefined ? 0 : GpsLonAnt;

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

$(document).ready(function (e) 
{

    var TimeGpsInterval = 60 * 1000;//3600 * 1000;

    var idGPSTRack = setInterval(function ()
    {
        if (window.sessionStorage.UserPromotor && db.EXISTS_TABLE("promotor_gps"))
            navigator.geolocation.getCurrentPosition(onSuccessGPSPormotor, onError);
    }, TimeGpsInterval);

    if (window.localStorage.getItem("LocalStorageDB-KannelMovil-::tables::") == undefined) {
        CreateDB("KannelMovil");
    }
    else {
        db = new LocalStorageDB("KannelMovil");
    }

    $("#loadingAJAX").width(window.innerWidth);
    $("#loadingAJAX").height(window.innerHeight);

    $("#ajaxgif").css(
	{
	    top: ((window.innerHeight / 2) - 80),
	    left: ((window.innerWidth / 2) - 40)
	});

    $("#btnTraslate").click(function (event) {
        $("#tInicio")._t("Example 3");
        $("#btnTraslate")._t("English");
    });

    var listaOb = ["#Texto1", "#tErrorLogin", "#tLogIn", "#tNoInternet", "#lLoading", "#lNoData", "#msgDropDB", "#msgSendData", "#msgDBSincOK", "#msgErrortabel"];

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
});

$(document).on("pagecreate", "#IndexPage", function() 
{
   
    RemoveSessionVar();

    window.sessionStorage.setItem("#History", JSON.stringify([{ 'path': 'root', 'pID': 0, 'oID': 0, 'Where': "", 'rowID': 0 }]));

    if (window.sessionStorage.UserLogin && window.sessionStorage.UserPromotor)
    {
       
        $("#lUserEmpresa").text("Empresa: "+ window.sessionStorage.UserEmpresa);
        $("#lUserName").text("Usuario: " + window.sessionStorage.UserLogin + "(" + window.sessionStorage.UserPromotor + ")");
		
        window.sessionStorage.setItem("empresa", window.sessionStorage.UserEmpresa);
	
        $("#dMessageNoDB").hide();
        $("#divUlModList").show();
        $("#btnViewCat").show();
        $("#btnUpdateData").show();
        $("#dMessageBDDone").hide();
        $("#btn_NewEncuestaDLG").show();

        $("#btnLogOut").click(function (e)
        {
            window.sessionStorage.clear();
            db.TRUNCATE("movil_User");
        });
		
        $("#btnDBDown").click(function(e) 
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
                            Mensage("No Coneccion.");
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
        });
		
		$("#btnLoadModules").click(function(e) 
		{
         	RefreshIndex();   
		});

		$("#btnUpdateData").click(function (e)
		{
		    var txtMsg = $("#msgSendData").text();

		    new Messi(txtMsg,
				{
				    title: 'Kannel Mobil',
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
					title: 'Kannel Mobil', 
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
    var empresa = window.sessionStorage.getItem("UserLogin");
    var userName = window.sessionStorage.getItem("UserEmpresa");

    if (empresa != null && userName != null)
    {
        window.location = "#IndexPage";
    }
    
});



