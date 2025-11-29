const cdk = require('aws-cdk-lib');
const apigateway = require('aws-cdk-lib/aws-apigateway');
const lambda = require('aws-cdk-lib/aws-lambda');

class ServerlessHelloApiStack extends cdk.Stack {
  constructor(scope, id, props) {
    super(scope, id, props);

    // --------- 1) API Gateway con logs a CloudWatch ---------
    const api = new apigateway.RestApi(this, 'HelloApi', {
      restApiName: 'HelloWorldApi',
      description: 'API de ejemplo con Mock y Lambda',
      deployOptions: {
        stageName: 'dev',
        loggingLevel: apigateway.MethodLoggingLevel.INFO, // nivel de logs
        dataTraceEnabled: true,                           // loguea request/response
        metricsEnabled: true,
      },
      cloudWatchRole: true, // permite a API Gateway escribir en CloudWatch
    });

    // --------- 2) Recurso /mock con integración MOCK ----------
    const mockResource = api.root.addResource('mock');

    // Respuesta JSON estática
    const mockIntegration = new apigateway.MockIntegration({
      integrationResponses: [
        {
          statusCode: '200',
          responseTemplates: {
            // Aquí definimos el body estático de la respuesta
            'application/json': JSON.stringify({
              message: 'Hello from API Gateway Mock integration!',
              source: 'mock',
            }),
          },
        },
      ],
      // template que indica a la integración que queremos devolver 200
      requestTemplates: {
        'application/json': '{"statusCode": 200}',
      },
    });

    mockResource.addMethod(
      'GET',
      mockIntegration,
      {
        methodResponses: [
          {
            statusCode: '200',
            responseModels: {
              'application/json': apigateway.Model.EMPTY_MODEL,
            },
          },
        ],
      }
    );

    // --------- 3) Lambda para respuestas dinámicas ------------
    const helloFn = new lambda.Function(this, 'HelloLambda', {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset('lambda'),
      description: 'Lambda que devuelve un mensaje aleatorio',
    });

    // --------- 4) Recurso /dynamic integrado con Lambda -------
    const dynamicResource = api.root.addResource('dynamic');

    const lambdaIntegration = new apigateway.LambdaIntegration(helloFn, {
      // Proxy TRUE => API Gateway pasa el request completo a Lambda
      // y utiliza { statusCode, body } devueltos por Lambda.
      proxy: true,
    });

    dynamicResource.addMethod(
      'GET',
      lambdaIntegration,
      {
        methodResponses: [
          {
            statusCode: '200',
            responseModels: {
              'application/json': apigateway.Model.EMPTY_MODEL,
            },
          },
        ],
      }
    );

    // --------- 5) Output de las URLs de la API ----------------
    new cdk.CfnOutput(this, 'MockEndpoint', {
      value: api.urlForPath('/mock'),
      description: 'Endpoint de la integración Mock',
    });

    new cdk.CfnOutput(this, 'DynamicEndpoint', {
      value: api.urlForPath('/dynamic'),
      description: 'Endpoint de la integración con Lambda',
    });
  }
}

module.exports = {
  ServerlessHelloApiStack,
};
