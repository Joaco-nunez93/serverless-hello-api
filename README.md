<div align="center">

# 🚀 Serverless Hello API

<img src="https://compote.slate.com/images/2119ff95-86f2-4546-a8fd-7b70ec58c9c6.jpeg?crop=1560%2C1040%2Cx0%2Cy0&width=370" alt="AWS Serverless" width="600"/>

### Proyecto serverless construido con **AWS CDK** que implementa un pipeline automático de procesamiento de imágenes utilizando **Amazon S3**, **AWS Lambda**, y **Sharp**.

[![AWS](https://img.shields.io/badge/AWS-CDK-orange?style=for-the-badge&logo=amazonaws)](https://aws.amazon.com/cdk/)
[![Lambda](https://img.shields.io/badge/AWS-Lambda-orange?style=for-the-badge&logo=awslambda)](https://aws.amazon.com/lambda/)
[![Node.js](https://img.shields.io/badge/Node.js-20.x-339933?style=for-the-badge&logo=nodedotjs)](https://nodejs.org/)
[![Sharp](https://img.shields.io/badge/Sharp-0.34.5-99CC00?style=for-the-badge)](https://sharp.pixelplumbing.com/)

</div>

---

Proyecto serverless construido con **AWS CDK (Cloud Development Kit)** que demuestra la creación de una API REST utilizando **API Gateway** con integraciones **Mock** y **Lambda**.

## 📋 Overview

El proyecto implementa dos patrones de integración diferentes:

- **Mock Integration**: Respuestas estáticas sin backend (ideal para prototipos y testing)
- **Lambda Integration**: Respuestas dinámicas procesadas por funciones AWS Lambda

## 🏗️ Arquitectura & Tecnologías

### **Core Technologies**

- **AWS CDK v2.215.0** - Infrastructure as Code framework para definir recursos AWS
- **AWS Lambda** - Funciones serverless para procesamiento de peticiones
- **API Gateway** - REST API para exponer endpoints HTTP
- **CloudWatch** - Monitoreo, logs y métricas
- **Node.js 20.x** - Runtime para las funciones Lambda
- **JavaScript** - Lenguaje de desarrollo (CDK y Lambda)

### **AWS Services**

- **Amazon API Gateway** - Gateway de API RESTful con logging completo
- **AWS Lambda** - Funciones serverless con ejecución bajo demanda
- **CloudWatch Logs** - Almacenamiento centralizado de logs
- **CloudWatch Metrics** - Métricas de rendimiento y uso
- **IAM** - Roles y permisos automáticos para los servicios

### **Development Tools**

- **Jest** - Framework de testing para pruebas unitarias
- **AWS CDK CLI** - Herramienta de línea de comandos para despliegue
- **CloudFormation** - Motor subyacente para el aprovisionamiento de recursos

## 📁 Estructura del Proyecto

```
serverless-hello-api/
├── bin/
│   └── serverless-hello-api.js       # Punto de entrada de la aplicación CDK
├── lib/
│   └── serverless-hello-api-stack.js # Definición del stack CDK (infraestructura)
├── lambda/
│   └── index.js                      # Código de la función Lambda
├── test/
│   └── serverless-hello-api.test.js  # Tests unitarios del stack
├── cdk.json                          # Configuración del CDK Toolkit
├── cdk.out/                          # Templates CloudFormation sintetizados
├── package.json                      # Dependencias npm
├── jest.config.js                    # Configuración de Jest
└── README.md                         # Documentación del proyecto
```

## ✨ Componentes Clave

### **1️⃣ Punto de Entrada CDK** (`bin/serverless-hello-api.js`)

```javascript
const app = new cdk.App();
new ServerlessHelloApiStack(app, 'ServerlessHelloApiStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
});
```

**Responsabilidades:**
- Inicializa la aplicación CDK
- Instancia el stack principal con configuración de región y cuenta
- Utiliza variables de entorno por defecto de AWS CLI

---

### **2️⃣ API Gateway con CloudWatch Logging**

```javascript
const api = new apigateway.RestApi(this, 'HelloApi', {
  restApiName: 'HelloWorldApi',
  description: 'API de ejemplo con Mock y Lambda',
  deployOptions: {
    stageName: 'dev',
    loggingLevel: apigateway.MethodLoggingLevel.INFO,
    dataTraceEnabled: true,
    metricsEnabled: true,
  },
  cloudWatchRole: true,
});
```

**Características:**
- **Stage**: `dev` (ambiente de desarrollo)
- **Logging Level**: `INFO` - registra información detallada de cada petición
- **Data Trace**: Habilitado - captura request/response completos
- **Metrics**: Habilitadas - métricas de latencia, errores y tráfico
- **CloudWatch Role**: Rol IAM automático para escritura de logs

---

### **3️⃣ Endpoint `/mock` - Integración Mock**

**Definición:**
```javascript
const mockResource = api.root.addResource('mock');
const mockIntegration = new apigateway.MockIntegration({
  integrationResponses: [{
    statusCode: '200',
    responseTemplates: {
      'application/json': JSON.stringify({
        message: 'Hello from API Gateway Mock integration!',
        source: 'mock',
      }),
    },
  }],
  requestTemplates: {
    'application/json': '{"statusCode": 200}',
  },
});
```

**Características:**
- **Método**: `GET /mock`
- **Backend**: Ninguno (respuesta directa desde API Gateway)
- **Latencia**: Muy baja (~10-20ms)
- **Costo**: Mínimo (sin invocaciones Lambda)

**Respuesta Esperada:**
```json
{
  "message": "Hello from API Gateway Mock integration!",
  "source": "mock"
}
```

**Casos de Uso:**
- ✅ Prototipos rápidos sin backend
- ✅ Testing de frontend independiente
- ✅ Health checks simples
- ✅ Documentación de API con respuestas de ejemplo

---

### **4️⃣ Función Lambda** (`lambda/index.js`)

**Código:**
```javascript
const messages = [
  "Hello World!",
  "Hello Serverless!",
  "It's a great day today!",
  "Yay, I'm learning something new today!",
  "On cloud nine!",
  "Over the moon!",
  "Shooting for the stars!",
  "On top of the World!",
  "World at my feet!",
  "Doing everything I love!"
];

exports.handler = async (event, context) => {
  const message = messages[Math.floor(Math.random() * messages.length)];
  return {
    statusCode: 200,
    body: JSON.stringify({ message })
  };
};
```

**Características:**
- **Runtime**: Node.js 20.x
- **Handler**: `index.handler`
- **Memoria**: 128 MB (por defecto)
- **Timeout**: 3 segundos (por defecto)
- **Comportamiento**: Selecciona un mensaje aleatorio de un array de 10 opciones

**Configuración CDK:**
```javascript
const helloFn = new lambda.Function(this, 'HelloLambda', {
  runtime: lambda.Runtime.NODEJS_20_X,
  handler: 'index.handler',
  code: lambda.Code.fromAsset('lambda'),
  description: 'Lambda que devuelve un mensaje aleatorio',
});
```

---

### **5️⃣ Endpoint `/dynamic` - Integración Lambda**

**Definición:**
```javascript
const dynamicResource = api.root.addResource('dynamic');
const lambdaIntegration = new apigateway.LambdaIntegration(helloFn, {
  proxy: true,
});
dynamicResource.addMethod('GET', lambdaIntegration);
```

**Características:**
- **Método**: `GET /dynamic`
- **Backend**: AWS Lambda (procesamiento dinámico)
- **Proxy Mode**: Habilitado - Lambda recibe el evento completo
- **Latencia**: ~50-200ms (depende del cold start)

**Respuesta Esperada (aleatoria):**
```json
{
  "message": "Shooting for the stars!"
}
```

**Flujo de Ejecución:**
```
Cliente → API Gateway → Lambda → Selección aleatoria → API Gateway → Cliente
```

---

### **6️⃣ Outputs de CloudFormation**

```javascript
new cdk.CfnOutput(this, 'MockEndpoint', {
  value: api.urlForPath('/mock'),
  description: 'Endpoint de la integración Mock',
});

new cdk.CfnOutput(this, 'DynamicEndpoint', {
  value: api.urlForPath('/dynamic'),
  description: 'Endpoint de la integración con Lambda',
});
```

**Ejemplo de Salida:**
```
Outputs:
ServerlessHelloApiStack.MockEndpoint = https://abc123xyz.execute-api.us-east-1.amazonaws.com/dev/mock
ServerlessHelloApiStack.DynamicEndpoint = https://abc123xyz.execute-api.us-east-1.amazonaws.com/dev/dynamic
```

## ☁️ Recursos AWS Creados

Al ejecutar `npx cdk deploy`, se crean los siguientes recursos en tu cuenta de AWS:

| Recurso | Tipo AWS | Propósito | Costo Estimado |
|---------|----------|-----------|----------------|
| **REST API** | `AWS::ApiGateway::RestApi` | API Gateway principal | ~$3.50/millón de peticiones |
| **API Deployment** | `AWS::ApiGateway::Deployment` | Stage `dev` con configuración | Incluido |
| **Lambda Function** | `AWS::Lambda::Function` | Función para `/dynamic` | Gratis (1M invocaciones/mes) |
| **Lambda Execution Role** | `AWS::IAM::Role` | Permisos para Lambda | Gratis |
| **CloudWatch Log Group** | `AWS::Logs::LogGroup` | Logs de API Gateway | $0.50/GB almacenado |
| **CloudWatch Log Group** | `AWS::Logs::LogGroup` | Logs de Lambda | $0.50/GB almacenado |

**💰 Costo Total Estimado**: **Gratis** dentro del Free Tier de AWS (hasta 1 millón de peticiones Lambda y 1 millón de llamadas API Gateway por mes).

## 🔄 Flujo de Funcionamiento

### **Escenario 1: Request a `/mock`**

```
┌─────────┐      GET /mock       ┌──────────────┐      Respuesta    ┌─────────┐
│         │ ──────────────────> │              │      Estática      │         │
│ Cliente │                      │ API Gateway  │ ─────────────────> │ Cliente │
│         │ <────────────────── │              │                    │         │
└─────────┘                      └──────────────┘                    └─────────┘
             ~20ms latencia                          Sin backend
```

**Ventajas:**
- ⚡ Latencia ultra baja
- 💰 Costo mínimo
- 🔧 Ideal para testing

---

### **Escenario 2: Request a `/dynamic`**

```
┌─────────┐   GET /dynamic   ┌──────────────┐   Invoca   ┌────────┐   Mensaje   ┌─────────┐
│         │ ───────────────> │              │ ─────────> │        │  Aleatorio  │         │
│ Cliente │                  │ API Gateway  │            │ Lambda │ ──────────> │ Cliente │
│         │ <─────────────── │              │ <───────── │        │             │         │
└─────────┘                  └──────────────┘            └────────┘             └─────────┘
            ~100ms latencia                   Selecciona           Devuelve
                                              mensaje              JSON
```

**Ventajas:**
- 🔄 Contenido dinámico
- 🎲 Lógica personalizable
- 📊 Procesamiento en backend

## 🚀 Comandos Útiles

### **Instalación**

```bash
# Instalar dependencias
npm install

# Instalar AWS CDK CLI globalmente (si no lo tienes)
npm install -g aws-cdk
```

### **Development**

```bash
# Sintetizar CloudFormation template (ver infraestructura generada)
npx cdk synth

# Ver diferencias con el stack desplegado actualmente en AWS
npx cdk diff

# Listar todos los stacks en la app
npx cdk list

# Ejecutar tests unitarios
npm run test
```

### **Deployment**

```bash
# Bootstrap de CDK (solo primera vez en una cuenta/región)
npx cdk bootstrap

# Desplegar stack a AWS
npx cdk deploy

# Desplegar sin confirmación (CI/CD)
npx cdk deploy --require-approval never

# Destruir todos los recursos creados
npx cdk destroy
```

### **Testing**

```bash
# Probar el endpoint Mock
curl https://YOUR-API-ID.execute-api.REGION.amazonaws.com/dev/mock

# Probar el endpoint Dynamic
curl https://YOUR-API-ID.execute-api.REGION.amazonaws.com/dev/dynamic

# Probar múltiples veces para ver respuestas aleatorias
for i in {1..5}; do curl https://YOUR-API-ID.execute-api.REGION.amazonaws.com/dev/dynamic; echo; done
```

## 💡 Ventajas del Proyecto

| Ventaja | Descripción |
|---------|-------------|
| **🚀 Serverless** | Sin servidores que administrar, pago solo por uso real |
| **📈 Escalabilidad Automática** | AWS escala automáticamente según la demanda (0 a millones de peticiones) |
| **📝 Infrastructure as Code** | Infraestructura versionable, reproducible y auditable |
| **🔍 Observabilidad** | Logs y métricas automáticos en CloudWatch |
| **💰 Bajo Costo** | Free Tier cubre la mayoría del uso de desarrollo |
| **⚡ Despliegue Rápido** | De código a producción en minutos |
| **🔒 Seguridad** | IAM roles y permisos mínimos por defecto |
| **🌍 Multi-región** | Fácil replicación en diferentes regiones AWS |

## 📚 Casos de Uso

Este patrón arquitectónico es ideal para:

| Caso de Uso | Descripción |
|-------------|-------------|
| 🎯 **Prototipos de APIs** | Validar diseño de API antes de desarrollar backend completo |
| 📱 **Backends Móviles/Web** | APIs escalables para apps móviles y SPAs |
| 🧪 **Testing de Frontend** | Mock endpoints para desarrollo frontend independiente |
| 🔔 **Webhooks** | Recepción de notificaciones de servicios externos |
| 📊 **APIs de Consulta** | Servicios de lectura de datos con bajo acoplamiento |
| 🔄 **Microservicios** | Componentes independientes con responsabilidad única |
| ⚡ **Serverless Functions** | Lógica de negocio sin gestión de servidores |

## 🛠️ Próximos Pasos Sugeridos

### **Nivel Básico**
- [ ] Agregar más endpoints con diferentes métodos HTTP (POST, PUT, DELETE)
- [ ] Implementar validación de request con modelos de API Gateway
- [ ] Configurar CORS para permitir peticiones desde navegadores
- [ ] Agregar variables de entorno a la función Lambda

### **Nivel Intermedio**
- [ ] **Persistencia**: Integrar DynamoDB para almacenamiento de datos
- [ ] **Autenticación**: Implementar API Keys o AWS Cognito
- [ ] **Throttling**: Configurar límites de rate limiting
- [ ] **Custom Domain**: Asignar un dominio personalizado a la API
- [ ] **Logging Avanzado**: Implementar X-Ray para trazabilidad distribuida

### **Nivel Avanzado**
- [ ] **CI/CD**: Pipeline con GitHub Actions o AWS CodePipeline
- [ ] **Multi-stage**: Ambientes separados (dev, staging, prod)
- [ ] **Monitoreo**: CloudWatch Dashboards y alarmas personalizadas
- [ ] **Performance**: Implementar caching con CloudFront
- [ ] **Security**: WAF (Web Application Firewall) para protección
- [ ] **Testing**: Tests de integración y E2E con Postman/Newman

## 📖 Recursos Adicionales

### **Documentación Oficial**
- [AWS CDK Documentation](https://docs.aws.amazon.com/cdk/)
- [AWS Lambda Developer Guide](https://docs.aws.amazon.com/lambda/)
- [Amazon API Gateway Developer Guide](https://docs.aws.amazon.com/apigateway/)

### **Tutoriales**
- [AWS CDK Workshop](https://cdkworkshop.com/)
- [Serverless Patterns Collection](https://serverlessland.com/patterns)

### **Best Practices**
- [CDK Best Practices](https://docs.aws.amazon.com/cdk/v2/guide/best-practices.html)
- [Lambda Best Practices](https://docs.aws.amazon.com/lambda/latest/dg/best-practices.html)

## 📄 Configuración del Proyecto

### **cdk.json**

El archivo `cdk.json` define cómo el CDK Toolkit ejecuta la aplicación:

```json
{
  "app": "node bin/serverless-hello-api.js",
  "context": {
    // Feature flags para comportamientos específicos de CDK
  }
}
```

### **package.json**

```json
{
  "name": "serverless-hello-api",
  "version": "0.1.0",
  "scripts": {
    "build": "echo \"No build step required for JavaScript\"",
    "cdk": "cdk",
    "test": "jest"
  },
  "dependencies": {
    "aws-cdk-lib": "2.215.0",
    "constructs": "^10.0.0"
  },
  "devDependencies": {
    "aws-cdk": "2.1033.0",
    "jest": "^29.7.0"
  }
}
```

## 🤝 Contribuciones

Este es un proyecto educativo. Si encuentras mejoras o tienes sugerencias:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto es de código abierto y está disponible para fines educativos.

---

**⭐ Si este proyecto te resultó útil, considera darle una estrella en GitHub!**
