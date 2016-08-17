var app = angular.module("app", []);

/**
 * Función que define la clase JavaScript encargada de realizar la petición AJAX que
 * recuperará los datos
 */
function RemoteResource($http, baseUrl) {

  // Método público que acepta dos funciones como parámetros que actuarán como callbacks.
  // Permite recuperar la información de un seguro mediante una petición GET
  this.get = function(fnOk, fnError) {
    $http({
      method: 'GET',
      url: baseUrl + '/datos.json'
    }).success(function(data, status, header, config) {
      fnOk(data);
    }).error(function(data, status, header, config) {
      fnError(data, status);
    });
  };

  // Método público que permite recuperar la lista de seguros mediante una petición GET
  this.list = function(fnOk, fnError) {
    $http({
      method: 'GET',
      url: baseUrl + '/listado_seguros.json'
    }).success(function(data, status, header, config) {
      fnOk(data);
    }).error(function(data, status, header, config) {
      fnError(data, status);
    });
  };
};

/**
 * Función que define el constructor del provider. Almacenará la URL a la que se pedirán los
 * recursos e invocará el servicio que hará la petición de los mismos cuando se invoque '$get'
 */
function RemoteResourceProvider() {
  var _baseUrl;

  // Método público para configurar el servicio. Se invoca desde el bloque 'config'
  this.setBaseUrl = function(baseUrl) {
    _baseUrl = baseUrl;
  };

  // Método '$get' que es el factory-provider. Define la función de factoría que hará la petición
  this.$get = ['$http', function($http) {
    return new RemoteResource($http, _baseUrl);
  }];
};

// Se registra el provider
app.provider("remoteResource", RemoteResourceProvider);

// URL donde estarán los recursos. Los datos estarán en la misma ruta que la web
app.constant("baseUrl", ".");

// Configuramos el provider 'remoteResource' que nos servirá para recuperar los recursos
app.config(['baseUrl', 'remoteResourceProvider', function(baseUrl, remoteResourceProvider) {
  remoteResourceProvider.setBaseUrl(baseUrl);
}]);

// URL donde estará el logo
app.value("urlLogo", "img/logo.png");

// Establecemos la URL del logo en el $rootScope para tenerlo disponible desde todas las páginas
app.run(["$rootScope", "urlLogo", function($rootScope, urlLogo) {
  $rootScope.urlLogo = urlLogo;
}]);

// Controlador para la página principal
app.controller("MainController", ["$scope", function($scope) {

}]);

// Controlador para la página del listado
app.controller("ListadoSegurosController", ["$scope", "remoteResource", function($scope, remoteResource) {
  $scope.seguros = [];

  // Usando el provider se invoca el método 'list' de la clase RemoteResource
  remoteResource.list(
    function(data) {
      $scope.seguros = data;
    },
    function(data, status) {
      console.error("Ha fallado la petición. Estado HTTP:" + status);
    }
  );
}]);

// Controlador para la página de detalles
app.controller("DetalleSeguroController", ["$scope", "remoteResource", function($scope, remoteResource) {
  $scope.seguro = {
    nif:"",
    nombre:"",
    apellido:"",
    edad:undefined,
    sexo:"",
    casado:false,
    numHijos:undefined,
    embarazada:false,
    coberturas: {
      oftalmologia:false,
      dental:false,
      fecundacionInVitro:false
    },
    enfermedades:{
      corazon:false,
      estomacal:false,
      rinyones:false,
      alergia:false,
      nombreAlergia:""
    },
    fechaCreacion:new Date()
  };

  // Definimos las opciones para la etiqueta 'select'
  $scope.sexos = [
    {
      codSexo: "H",
      descripcion: "Hombre"
    },{
      codSexo: "M",
      descripcion: "Mujer"
    }
  ];

  // Usando el provider se invoca el método 'get' de la clase RemoteResource
  remoteResource.get(
    function(data) {
      $scope.seguro = data;
    },
    function(data, status) {
      console.error("Ha fallado la petición. Estado HTTP: " + status);
    });
}]);