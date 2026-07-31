
/*LIBRERIAS*/
#include <EEPROM.h>
#include <LowPower.h>
#include <Wire.h>
#include "ds3231.h"
#include <SoftwareSerial.h>


/*CONSTANTES*/
#define BUFF_MAX 256
//unsigned int fin = 0;
//unsigned int l = 0;
//unsigned int fin1 = 0;
SoftwareSerial SIM900(7, 8);
SoftwareSerial r_serial(10, 11); // RX, TX

/*ASIGNACION VARIABLES*/
//INTERRUPCIONES
volatile int despiertaMenu = LOW;
volatile int despiertaACK = LOW;
//byte pinint_config;

//MENU CONFIGURACION
bool m_config = LOW ;
struct calib
{
  float m;
  float b;
};
struct calib calibracion;

//TIMERS
byte seg_acq;
byte hora_acq;
byte min_acq;
int inter_envio;
//bool init_off = HIGH;
int nTransmSet = 0;  //NUMERO DE VECES INTERVALOS DE ACQ NECESARIOS PARA TRANSMITIR
int nTransmAcc = 0; //NUMERO DE VECES INTERVALOS DE ACQ ACUMULADOS PARA TRANSMITIR
bool duerme = LOW;
bool tack = LOW ;
bool tenv = LOW ;

//MEMORIA
int dispositivo = 80;
unsigned long dirmemo = 4;
int nro_pagina = 0;
unsigned long ultimadir;
const unsigned long maxdir = 131071;
const int wp = 12;

//CONTROL
const int pincontrol = 6;
byte cont;
bool sal;

//COMUNICACION SERIAL SENSOR
int recibido;
byte j = 0;
int m;
bool ack = LOW;
bool nak = LOW;
const char STX = '\x002';
const char ETX = '\x003';
const char ACK = '\x006';
const char NAK = '\x015';
const int TimeOut = 1500;
int var = 0;
struct DataMessage
{
  int value;
};
struct DataMessage message;
enum SerialResult
{
  OK,
  ERR,
  NO_RESPONSE,
};

//Variables y constantes GSM
bool GSMOn = HIGH;
//int i = 1 ;
//int K = 1;
int respuesta;
char aux_str[20];
//String direccion = "GET /save-get.php?dato=";
//Contenido de la dirección Http
String direccion1 = "HTTP/1.1\r\nHost: ";
String direccion3;
String direccion2 = "\r\nConnection: close\r\n\r\n";
//unsigned long t_transm = 0;
//unsigned int t_tr = 0;

//Variables serial
//const int rtcpin = 13;
//char conc[45];

/*FIN VARIABLES*/








/*FUNCIONES*/
/*FUNCION LECTURA VCC*/

long readVcc() {
  ADMUX = _BV(REFS0) | _BV(MUX3) | _BV(MUX2) | _BV(MUX1);
  delay(2);
  ADCSRA |= _BV(ADSC);
  while (bit_is_set(ADCSRA, ADSC));

  long result = ADCL;
  result |= ADCH << 8;
  result = 1090700L / result; // Back-calculate AVcc in mV calibrado
  return result;
}














/*FUNCIONES DE COMUNICACION CON EL SENSOR*/



void SendMessage(byte *structurePointer, int structureLength)                          //ENVIA PAQUETE
{ r_serial.write(STX);
  r_serial.write(structurePointer, structureLength);
  //Serial.print(structureLength);
  uint16_t checksum = ChecksumFletcher16(structurePointer, structureLength);
  r_serial.write((byte)checksum);
  r_serial.write((byte)checksum >> 8);
  r_serial.write(ETX);
}


int TryGetACK(int timeOut)                                                            //RECIBE EL ACK Y ES EL TIMEOUT
{
  unsigned long startTime = millis();
  while (!r_serial.available() && (millis() - startTime) < timeOut)
  {
  }
  if (r_serial.available())
  {
    if (r_serial.read() == ACK) return OK;
    if (r_serial.read() == NAK) return ERR;
  }
  return NO_RESPONSE;
}




int ProcessACK(const int timeOut,                                                      //PROCESA EL ACK
               void (*okCallBack1)(),
               void (*errorCallBack1)())
{
  int rst = TryGetACK(timeOut);
  if (rst == OK)
  {
    if (okCallBack1 != nullptr) okCallBack1();
  }
  if (rst == ERR)
  {
    if (errorCallBack1 != nullptr) errorCallBack1();
  }
  return rst;
}
void okAction1(byte *data, const uint8_t dataLength)                                 //FUNCIONES CALLBACK
{

  ack = LOW;
}
void errorAction1(byte *data, const uint8_t dataLength)
{

}


uint16_t ChecksumFletcher16(const byte *data, int dataLength)                       //FUNCION CHECKSUM
{
  uint8_t sum1 = 0;
  uint8_t sum2 = 0;

  for (int index = 0; index < dataLength; index++)
  {
    sum1 = sum1 + data[index];
    sum2 = sum2 + sum1;
  }
  return (sum2 << 8) | sum1;
}

int TryGetSerialData(byte *data, uint8_t dataLength, int timeOut)                  //FUNCION PARA OBTENER EL DATO
{
  unsigned long startTime = millis();

  while (r_serial.available() < (dataLength + 4) && (millis() - startTime) < timeOut)
  {

  }


  if (r_serial.available() >= dataLength + 4)
  {


    if (r_serial.read() == STX)
    {
      for (int i = 0; i < dataLength; i++)
      {
        data[i] = r_serial.read();
        //Serial.println(data[i]);
      }
      uint16_t checksum = ChecksumFletcher16(data, dataLength);
      byte a = (byte)checksum;
      byte b = (byte)checksum >> 8;
      if ((a == r_serial.read() && b == r_serial.read()) && r_serial.read() == ETX)

      {


        return OK;
      }
      return ERR;
    }
  }
  return NO_RESPONSE;
}

int ProcessSerialData(byte *data, const uint8_t dataLength, const int timeOut,                       //VALIDA EL PAQUETE DE DATOS
                      void (*okCallBack)(byte *, const uint8_t ),
                      void (*errorCallBack)(byte *, const uint8_t ))
{
  int rst = TryGetSerialData(data, dataLength, timeOut);
  if (rst == OK)
  {
    r_serial.write(ACK);
    if (okCallBack != nullptr) okCallBack(data, dataLength);
  }
  if (rst == ERR)
  {
    r_serial.write(NAK);
    if (errorCallBack != nullptr) errorCallBack(data, dataLength);
  }
  return rst;
}

void okAction(byte *data, const uint8_t dataLength)                                      //SI EL PAQUETE ES VALIDO EXTRAE EL DATO
{
  //Serial.print (F("Sensor:"));

  byte *pointer = (byte*)&var;
  for (byte j = 0; j < 2; j++)
  {
    pointer[j] = data[j];
  }
}

void errorAction(byte *data, const uint8_t dataLength)
{
  var = -1000;
}
















/*FUNCIONES RELACIONADAS CON EL ENVIO DE DATOS POR GSM*/
int enviarAT(char* ATcommand, char* resp_correcta, unsigned int tiempo)
{

  int x = 0;
  bool correcto = 0;
  char respuesta[200];
  unsigned long anterior;

  memset(respuesta, '\0', 100); // Inicializa el string
  delay(200);
  while ( SIM900.available() > 0) SIM900.read(); // Limpia el buffer de entrada
  SIM900.println(ATcommand); // Envia el comando AT
  x = 0;
  anterior = millis();
  // Espera una respuesta
  do {
    // si hay datos el buffer de entrada del UART lee y comprueba la respuesta
    while (SIM900.available() != 0)
    {
      //Comprueba que no haya desbordamiento en la capacidad del buffer
      if (x < 199) {
        respuesta[x] = SIM900.read();
        x++;
      }
      else
      {
        Serial.println(F("Desbordamiento!"));
        x = 0;
      }
    }
    // Comprueba si la respuesta del modulo es la 1
    //Serial.print("respuesta! ");
    //Serial.println(respuesta);

    if (strstr(respuesta, resp_correcta) != NULL)
    {
      correcto = 1;
    }

  }
  // Espera hasta tener una respuesta
  while ((correcto == 0) && ((millis() - anterior) < tiempo));
  Serial.println(respuesta);

  return correcto;
}

bool power_on()
{
  int cont = 0;
  bool timeOut = HIGH;
  int respuesta = 0;
  unsigned long anterior;
  // Comprueba que el modulo SIM900 esta arrancado
  if (enviarAT("AT", "OK", 2000) == 0)
  {
    Serial.println(F("Encendiendo el GPRS..."));

    //pinMode(9, OUTPUT);
    //digitalWrite(9, HIGH);
   // delay(1000);
    //digitalWrite(9, LOW);
    delay(1000);
    anterior = millis();
    while ((millis() - anterior) < 10000)
    {
      if (SIM900.available())
      {
        Serial.write(SIM900.read());
      }
    }
    // Espera la respuesta del modulo SIM900
    while (respuesta == 0 && timeOut == HIGH) {
      // Envia un comando AT cada 2 segundos y espera la respuesta
      respuesta = enviarAT("AT", "OK", 2000);
      SIM900.println(respuesta);
      cont++;
      if (cont == 4) timeOut = LOW;
    }
  }
  return (timeOut);
}

void power_off()
{
  digitalWrite(9, HIGH);
  delay(1000);
  digitalWrite(9, LOW);
  delay(1000);
}

void reiniciar()
{
  Serial.println(F("Reiniciando..."));
  power_off();
  delay (5000);
  power_on();
}

int iniciar()
{
  unsigned long anterior;
  int cont = 0;
  int redm = 1;
  enviarAT("AT+IPR=19200", "OK", 3000);
  enviarAT("AT+CSQ", "OK", 3000);
  //enviarAT("AT+CGATT", "OK", 3000);
  enviarAT("AT+CNMI=0,0,0,0,0", "OK", 3000);
  enviarAT("AT+CPIN?", "OK", 3000);
  //enviarAT("AT+CPIN=\"1234\"", "OK", 1000); //Introducimos el PIN de la SIM
  Serial.println(F("Conectando a la red..."));
  delay(5000);
  //Espera hasta estar conectado a la red movil
  while ( (enviarAT("AT+CREG?", "+CREG: 0,1", 1000) == 0) && (cont < 11) )
  {
    if (cont == 10) redm = 0;  //Hace 10 intentos de conectar a la rel movil
    cont++;
  }
  if (redm == 1)
  {
    enviarAT("AT+CGATT=1\r", "OK", 1000); //Iniciamos la conexión GPRS
    enviarAT("AT+CSTT=\"wap.gprs.unifon.com.ar\",\"wap\",\"wap\"", "OK", 3000); //Definimos el APN, usuario y clave a utilizar
    enviarAT("AT+CIICR", "OK", 3000); //Activamos el perfil de datos inalámbrico
    enviarAT("AT+C IFSR", "", 3000); //Activamos el perfil de datos inalámbrico
    anterior = millis();
    while ((millis() - anterior) < 20000)
    {
      if (SIM900.available())
      {
        Serial.write(SIM900.read());
      }
    }
  }
  return (redm);

}

void PeticionHttp()
{
  unsigned long anterior;
  int j = 0;
  enviarAT("AT", "OK", 2000);
  while (j < nro_pagina)
  {
     dirmemo=ultimadir-(8*(nro_pagina-j));
     String direccion = leepagina(LOW);
    if (enviarAT("AT+CREG?", "+CREG: 0,1", 500) == 1) //Comprueba la conexion a la red
    {

      String direccion4 = "AT+CIPSTART=\"TCP\",\"";
      String direccion5 = "\",\"80\"";
      String dirstart = direccion4 + direccion3 + direccion5;
      int buff_len= dirstart.length()+1;
      char conc[buff_len];
      dirstart.toCharArray(conc, buff_len);
      
      if (enviarAT(conc, "CONNECT OK", 15000)==1){ //Inicia una conexión TCP
      buff_len= direccion.length()+1;
      char conc1[buff_len];
      direccion.toCharArray(conc1, buff_len);

      sprintf(aux_str, " AT+CIPSEND=%d", strlen(conc1));  // Envíamos datos a través del TCP
      if (enviarAT(aux_str, ">", 30000) == 1)
      {
        enviarAT(conc1, "OK", 10000);
      }
      anterior = millis();
      while ((millis() - anterior) < 25000)
      {
        if (SIM900.available())
        {
          Serial.write(SIM900.read());
        }
      }

      }
    }    
    //else
   // {
     // reiniciar();
    // iniciar();
   // }
    j++;

  }
}








/* SE COMUNICA CON EL SENSOR Y ESPERA RESPUESTA*/


void cabezal(char caracter)
{
  cont = 0;
  ack = HIGH;
  sal = HIGH;
  message.value = caracter;
  while (ack == HIGH && sal == HIGH  ) //si recibe respuesta ack, y si respnde espera el dato del lector del sensor
  {
    SendMessage((byte*)&message, sizeof(message));
    ProcessACK(TimeOut, okAction1, errorAction1);
    cont++;

    if (cont == 20)

    {

      sal = LOW;
    }
  }
  if (sal == HIGH)
  {
    int r = ProcessSerialData((byte*)&message, sizeof(message), TimeOut, okAction, errorAction);

    if (r == NO_RESPONSE)
    {
      if (m_config == HIGH)
      {

        //Serial.println(F("No responde 2"));
      }
      var = -1002;
    }


  }
  else
  {
    if (m_config == HIGH)
    {
      //Serial.println(F("No responde 1"));
    }
    var = -1001;
  }


  r_serial.flush();
}



/*FUNCIONES ESCRITURA/LECTURA MEMORIA DE DATOS*/
void writeeeprom(int deviceaddress, unsigned int eeaddress, byte *data, int dataLength )
{
  digitalWrite(wp, LOW);
  Wire.beginTransmission (deviceaddress);
  Wire.write ((int)(eeaddress >> 8));
  Wire.write ((int)(eeaddress & 0xFF));
  for (byte i = 0; i < dataLength; i++)
  {
    Wire.write(data[i]);
    delay(5);
  }
  Wire.endTransmission();
  digitalWrite(wp, HIGH);
}

void readeeprom (int deviceaddress, unsigned int eeaddress, byte *prdata, int dataLength)
{
  Wire.beginTransmission (deviceaddress);
  Wire.write ((int)(eeaddress >> 8));
  Wire.write ((int)(eeaddress & 0xFF));
  Wire.endTransmission ();
  Wire.requestFrom (deviceaddress, dataLength);
  for (int i = 0; i < dataLength; i++)
  {
    if (Wire.available())
    {
      prdata[i] = Wire.read();
      delay(5);
    }

  }

}

String leepagina(bool descarga)
{

  byte dia = 0;
  byte mes  = 0;
  int anio = 0;
  byte hora = 0 ;
  byte minuto = 0;
  int altura = 0;
  float ha = 0;
  String d;
  String m;
  String h;
  String mm;
  String muestra;
 
  dirmemo = dirmemo - 1;
  memorias_r();
  dirmemo = dirmemo - 1;
  memorias_r();
  readeeprom (dispositivo, dirmemo, (byte*)&altura, sizeof(altura));
  dirmemo = dirmemo - 1;
  memorias_r();
  readeeprom (dispositivo, dirmemo, (byte*)&minuto, sizeof(minuto));
  dirmemo = dirmemo - 1;
  memorias_r();
  readeeprom (dispositivo, dirmemo, (byte*)&hora, sizeof(hora));
  dirmemo = dirmemo - 1 ;
  memorias_r();
  dirmemo = dirmemo - 1 ;
  memorias_r();
  readeeprom (dispositivo, dirmemo, (byte*)&anio, sizeof(anio));
  dirmemo = dirmemo - 1 ;
  memorias_r();
  readeeprom (dispositivo, dirmemo, (byte*)&mes, sizeof(mes));
  dirmemo = dirmemo - 1;
  memorias_r();
  readeeprom (dispositivo, dirmemo, (byte*)&dia, sizeof(dia));
  ha = altura ;
  ha = ha / 10;
  if (altura == -1000)ha = altura;
  if (altura == -1001)ha = altura;
  if (altura == -1002)ha = altura;
  d = dia;
  m = mes;
  h = hora;
  mm = minuto;
  if (dia < 10)
    d = "0" + d;
  if ( mes < 10 )
    m = "0" + m;
  if ( hora < 10 )
    h = "0" + h;
  if ( minuto < 10)
    mm = "0" + mm;

  if (descarga == HIGH )
  {
        muestra = muestra + d + "/" +  m + "/" + anio + " " + h + ":" + mm + " " + ha;
        return muestra;
        
    }
 if (descarga == LOW)
       {
        String direccion = "GET /save-get.php?dato=";
        digitalWrite (pincontrol, HIGH);
        float bateria=Bat();
        digitalWrite (pincontrol, LOW);
        int b1=bateria;
        int b2=(bateria-b1)*10;
        int hae=ha;
        int had=(ha-hae)*10;
      if (had<0) had=-had;         
      
        direccion = direccion + dia + "-" + mes + "-" + anio + "%20" + hora + ":" + minuto + "%20" + hae + "," + had + "%20" + b1 + "," + b2 + " " + direccion1;
        return direccion;
       } 
 // else 
 // {
    //direccion = "GET /save-get.php?dato=prueba%20ok " + direccion1;
    //direccion = direccion + dia + "-" + mes + "-" + anio + "%20" + hora + ":" + minuto + "%20" + ha + " " + direccion1;
 // }
}

void memorias_r()
{

  if (dispositivo == 81)
  {
    if (dirmemo < 4)
    {
      dispositivo = 80;
      dirmemo = maxdir;
    }
  }

}
float sensor_profundidad()
{
  int Vcc;
  //r_serial.listen();
  float pesp;
  float temp;
  cabezal('a');
  int Vout = var;
  if (var == -1000 ||  var == -1001 || var == -1002) {}
  else
  {
    cabezal('b');
    Vcc = var;
    cabezal('c');
    temp = var / 10;
    if (temp <= 15)
    { pesp = 0.09810;
    }
    else {
      pesp = 0.0001 * pow(temp, 4) - 0.0162 * pow(temp, 3) + 0.7749 * pow(temp, 2) - 17.998 * temp + 9953.7;
      pesp = pesp / 100000;
    }
  }
  digitalWrite (10, LOW);
  digitalWrite (11, LOW);
  float alt = (calibracion.m * Vout / (Vcc * 0.009 * pesp)) - (0.04 / (0.009 * pesp)) + calibracion.b;

  return alt;
}

float sensor_temp()
{
  //r_serial.listen();
  cabezal('c');
  digitalWrite (10, LOW);
  digitalWrite (11, LOW);
  float alt = var;
  return alt;
}

int sensor_Vcc()
{
  //r_serial.listen();
  cabezal('b');
  digitalWrite (10, LOW);
  digitalWrite (11, LOW);
  int alt = var;
  return alt;
}

void memorias()
{
  if ( dirmemo == 131072 && dispositivo == 80)
  {

    ultimadir = dirmemo;
    writeeeprom(dispositivo, 0 , (byte*)&ultimadir, sizeof(ultimadir));
    dirmemo = 4;
    dispositivo = 81;
  }

  if ( dirmemo == 131072 && dispositivo == 81)
  {
    ultimadir = dirmemo;
    writeeeprom(dispositivo, 0 , (byte*)&ultimadir, sizeof(ultimadir));
    dirmemo = 4;
    dispositivo = 80;
  }

}


int graba_pagina()
{
  char buff[BUFF_MAX];
  struct ts t;
  digitalWrite (pincontrol, HIGH); //despierta al lector del sensor
  float hp = sensor_profundidad() * 10;
  int h = hp;
  if (Bat() > 5)
  {
    if (var == -1000)h = var;
    if (var == -1001)h = var;
    if (var == -1002)h = var;
    digitalWrite (pincontrol, LOW); //manda a dormir al lector del sensor
    DS3231_get(&t);
    byte dia =  t.mday;
    byte mes  =  t.mon;
    int anio = t.year;
    byte hora = t.hour;
    byte minuto = t.min;
    int finaldir;
    writeeeprom(dispositivo, dirmemo , (byte*)&dia, sizeof(dia));
    dirmemo++;
    memorias();
    writeeeprom(dispositivo, dirmemo , (byte*)&mes, sizeof(mes));
    dirmemo++;
    memorias();
    writeeeprom(dispositivo, dirmemo , (byte*)&anio, sizeof(anio));
    dirmemo++;
    memorias();
    dirmemo++;
    memorias();
    writeeeprom(dispositivo, dirmemo , (byte*)&hora, sizeof(hora));
    dirmemo++;
    memorias();
    writeeeprom(dispositivo, dirmemo , (byte*)&minuto, sizeof(minuto));
    dirmemo++;
    memorias();
    writeeeprom(dispositivo, dirmemo , (byte*)&h, sizeof(h));
    dirmemo++;
    memorias();
    dirmemo++;
    memorias();

    writeeeprom(dispositivo, 0 , (byte*)&dirmemo, sizeof(dirmemo));

    ultimadir = dirmemo;
    finaldir = dirmemo;
    return finaldir;
  } else {
    digitalWrite (pincontrol, LOW);
  }
}

void caracterFinProceso()
{
  Serial.println(F("#@"));
}

/*FUNCION TIMEOUT*/
bool  timeOut()
{
  char caracterReconocimiento[2] = "";
  bool reconocimiento = HIGH;
  long timeout;
  timeout = millis();

  while (reconocimiento == HIGH && (millis() - timeout) < 10000)
  {

    if (Serial.available() > 0)
    {
      caracterReconocimiento[0] = Serial.read();
      delayMicroseconds(1000);
      caracterReconocimiento[1] = Serial.read();
      delayMicroseconds(1000);
      while ( Serial.available() > 0) Serial.read();
      if (caracterReconocimiento[0] == '%' && caracterReconocimiento[1] == '#')
      {
        reconocimiento = LOW;
        Serial.println(F("HI"));
      }

    }
  }
  return (reconocimiento);
}


void muestraSensor()
{

  float hb = sensor_profundidad();
  if (Bat() > 5)
  {
    if (var == -1000)hb = var;
    if (var == -1001)hb = var;
    if (var == -1002)hb = var;
    //Serial.print (F("Altura: "));
    Serial.println (hb, 3);
  } else {
    hb = -1003;
    Serial.println (hb, 1);
  }

}






/*BUCLE DE CONFIGURACION*/

void menuConfiguracion()
{
  bool GSMOn = HIGH;
  int npag;
  char a;
  char menu;
  bool salir = LOW;
  bool salirMenu = LOW;
  long timeout;
  timeout = millis();
  while ( Serial.available() > 0 && millis() - timeout < 10) Serial.read();
  salirMenu = timeOut();
  /*if (salirMenu==LOW)
    {

    }*/
  while (salirMenu == LOW)
  {

    while (Serial.available() == 0);
    if (Serial.available() > 0)
    {

      menu = Serial.read();
      switch (menu)
      {
        case 'a'://DATOS EN TIEMPO REAL
          {
            r_serial.listen();
            while (salir == LOW)
            {

              //graba_pagina();
              digitalWrite (pincontrol, HIGH); //despierta al lector del sensor
              muestraSensor();
              a = Serial.read();
              if ( a == 's')
              {
                salir = HIGH;
                digitalWrite (pincontrol, LOW); //manda a dormir al lector del sensor
                caracterFinProceso();
              }
            }
            salir = LOW;
          }
          break;
        case 'b'://ENVIA VALORES CALIBRACION
          {
            leeCalSensor();
            caracterFinProceso();
          }
          break;
        case 'i'://CAMBIA VALORES CALIBRACION
          {
            cambiaCal();
            caracterFinProceso();
          }
          break;



        case 'c'://CAMBIA VALORES DE TIEMPO DE INTERVALO DE ADQUISICION DE DATOS
          {
            cambiaTAcq();   /*SIRVE PARA AJUSTAR EL INTERVALO DE TOMA DE DATOS*/
            caracterFinProceso();
          }
          break;
        case 'd'://LEE DATOS DE LA MEMORIA PARA DESCARGA EN LA APP
          {
            dirmemo = ultimadir  ;

            if (dispositivo == 80 && dirmemo <= 4)
            {
              Serial.println(F("No Hay datos"));
            }
            while (dispositivo >= 80 && dirmemo > 4)
            {

              {
                String mostrar = leepagina(HIGH);
                Serial.println(mostrar);
              }


            }

            //SITUAMOS DE NUEVO EL PUNTERO DE MEMORIA EN LA ULTIMA DIRECCION DE GRABACION
            initmem();
            nro_pagina = 0;
            dirmemo = ultimadir;
            caracterFinProceso();
          }
          break;

        case 'e'://BORRA MEMORIA
          {
            Serial.println(F("Restableciendo memoria....."));
            ultimadir = 4;
            dispositivo = 80;
            writeeeprom(dispositivo, 0 , (byte*)&ultimadir, sizeof(ultimadir));
            delay(10);
            readeeprom(dispositivo, 0 , (byte*)&ultimadir, sizeof(ultimadir));
            Serial.print(F("unltima dir: "));
            Serial.println(ultimadir);
            dirmemo = ultimadir;
            caracterFinProceso();
          }
          break;

        case 'f'://MUESTRA HORA EN BUCLE
          {
            muestraHora();
            caracterFinProceso();
          }
          break;
        case 'g'://TEST DEL GSM
          {
            //digitalWrite (5,HIGH);
            SIM900.begin(19200);
            SIM900.listen();
            npag = nro_pagina;
            nro_pagina = 2;
            Serial.println(F("Iniciando..."));
            if (readVcc() > 4750)
            {
              GSMOn = power_on();
              if (GSMOn == HIGH)
              {
                if (iniciar() == 1)
                {
                  PeticionHttp();
                  enviarAT("AT+CIPCLOSE", "CLOSE OK", 10000); //Cerramos la conexion
                  enviarAT("AT+CIPSHUT", "OK", 10000); //Cierra el contexto PDP del GPRS
                  delay(10000);
                }

              } else if (GSMOn == LOW)
              {
                Serial.println(F("Modulo GSM No responde"));
                GSMOn = HIGH;
              }
            } else {
              Serial.println(F("Bateria baja"));
            }
            power_off();
            SIM900.end();
            initmem();
            dirmemo = ultimadir;
            nro_pagina = npag;
            digitalWrite (7, LOW);
            digitalWrite (8, LOW);
            caracterFinProceso();
          }
          break;
        case 'h'://VUELVE A MODO LOGGER
          {
            salirMenu = HIGH;
            caracterFinProceso();
            delayMicroseconds(10000);
          }
          break;

        case 'j'://LEE DIRECCION DEL SERVIDOR ALMACENADA
          {
            leeServer();
            caracterFinProceso();
          }
          break;

        case 'k'://CAMBIA DIRECCION DEL SERVIDOR ALMACENADA
          {
            cambiaServer();
            caracterFinProceso();
          }
          break;
        case 'l'://LEE VALORES DE INTERVALO DE ACQ ALMACENADOS
          {
            cargaTimer();
            caracterFinProceso();
          }
          break;
        case 'm'://SETEA LA FECHA Y LA HORA DEL RTC
          {
            ajusteHora();
            caracterFinProceso();
          }
          break;

        case 'n':
          {
            cadaCuantoTransmite();
            caracterFinProceso();
          }
          break;

        case 'o':
          {
            seteaIntTransmision();
            caracterFinProceso();
          }
          break;
        case 'p':
          {
            r_serial.listen();
            digitalWrite (pincontrol, HIGH); //despierta al lector del sensor
            Serial.print(F("Tcabezal: "));
            delay(10);
            float temp = sensor_temp() / 10;
            Serial.println(temp, 1);
            carga_calibracion();
            float pesp;
            if (temp <= 15)
            { pesp = 9810;
            }
            else {
              pesp = 0.0001 * pow(temp, 4) - 0.0162 * pow(temp, 3) + 0.7749 * pow(temp, 2) - 17.998 * temp + 9953.7;
            }
            Serial.print(F("Pesp: "));
            Serial.println(pesp, 1);
            Serial.print(F("Intervalo de toma de datos: "));
            cargaTimer();
            Serial.print(F("Servidor: "));
            leeServer();
            delayMicroseconds(10000000);
            muestraBat();
            digitalWrite (pincontrol, LOW);
            caracterFinProceso();
          }
          break;
        case 'q':
          {
            caracterFinProceso();
          }
          break;
        case 'r':
          {
            muestraAlarma();
          }
          break;
          case 't':
          {
            digitalWrite (pincontrol, HIGH);
            muestraBat();
            digitalWrite (pincontrol, LOW);
          }
          break;
        default:
          {
            //Serial.println (F("comando incorrecto"));
          }
          break;
      }

    }
    delay (100);
    while ( Serial.available() > 0) Serial.read();
  }
}

void muestraBat()
{

  Serial.print(F("Vbat: "));
  Serial.print(Bat());
  Serial.println(F("V"));

}

float Bat()
{
  float Vcc = readVcc() / 1000.0;
  float voltage = (analogRead(A0) / 1024.0) * Vcc;
  voltage = (voltage * 4) +0.5;
  return voltage;

}


void leeServer()
{
  byte capacidad;
  char caracteres;
  direccion3 = "";
  EEPROM.get(17, capacidad);
  for (int j = 18; j < capacidad; j++)
  {
    EEPROM.get(j, caracteres);
    direccion3 = direccion3 + caracteres;
  }
  Serial.println(direccion3);
  //Serial.println(direccion1);
}


void cambiaServer()
{
  int i;
  char caracteres;
  caracterFinProceso();
  delay(100);

  while (Serial.available() == 0)
  {

  }

  if (Serial.available() > 0)
  {


    delay(100);
    //while ( Serial.available() > 0) Serial.read();
    //while (Serial.available() == 0);
    i = 18;
    while (Serial.available() > 0)
    {
      caracteres = Serial.read();
      EEPROM.put(i, caracteres);
      delay(100);
      i++;
    }

    byte capacidad = 0;
    capacidad = i;
    EEPROM.put(17, capacidad);
    delay(1000);
    direccion3 = "";
    for (int j = 18; j < capacidad; j++)
    {
      EEPROM.get(j, caracteres);
      direccion3 = direccion3 + caracteres;
    }
    direccion1 = "";
    direccion1 = "HTTP/1.1\r\nHost: ";
    direccion1 = direccion1 + direccion3 + direccion2;
    delay(100);

  }
}



void muestraHora()
{
  char buff[BUFF_MAX];
  //unsigned long now = millis();
  struct ts t;
  int segundo;
  bool salir = LOW;
  // once a while show what is going on
  //if ((now - prev > interval) && (Serial.available() <= 0)) {
  DS3231_get(&t);

  // display current time
  segundo = t.sec;

  while (salir == LOW)
  {
    DS3231_get(&t);
    if (segundo != t.sec)
    {
      segundo = t.sec;
      snprintf(buff, BUFF_MAX, "%d/%02d/%02d %02d:%02d:%02d", t.mday,
               t.mon, t.year, t.hour, t.min, t.sec);
      Serial.println(buff);
    }
    if (Serial.read() == 's') salir = HIGH;
  }




}


/*FUNCION PARA SETEAR HORA*/
void ajusteHora()
{
  struct ts t;
  char total[14];
  int anio;
  char dosbytes[2];
  int i = 0;
  //int k = 0;
 
  caracterFinProceso();
   delay(100);
   while ( Serial.available() > 0) Serial.read();
 //Serial.flush();
 //
 
  while (Serial.available() == 0)
  {
   //Serial.println("while= ");
  }

 if (Serial.available() > 0)
  {
  delay(100);
  
  while ( Serial.available() > 0)
  {

    total[i] = Serial.read();
    //delayMicroseconds(1000);
    i++;
    
  }
    for (int r=0; r <14; r++){ Serial.println(total[r]);}
  
  dosbytes[0] = total[12];
  dosbytes[1] = total[13];
  t.sec = atol(dosbytes);
  dosbytes[0] = total[0];
  dosbytes[1] = total[1];
  t.mday = atol(dosbytes);
  dosbytes[0] = total[2];
  dosbytes[1] = total[3];
  t.mon = atol(dosbytes);
  dosbytes[0] = total[4];
  dosbytes[1] = total[5];
  int anio1 = atol(dosbytes);
  dosbytes[0] = total[6];
  dosbytes[1] = total[7];
  int anio2 = atol(dosbytes);
  anio = anio1 * 100 + anio2;
  t.year = anio;
  dosbytes[0] = total[8];
  dosbytes[1] = total[9];
  t.hour = atol(dosbytes);
  dosbytes[0] = total[10];
  dosbytes[1] = total[11];
  t.min = atol(dosbytes);
 DS3231_set(t);
 //Serial.println(t.mday);
 //Serial.println(t.mon);
 //Serial.println(t.year);
// Serial.println(t.hour);
 //Serial.println(t.min);
 //Serial.println(t.sec);
  }

}






void leeCalSensor() {
  char menu;
  EEPROM.get (0, calibracion);
  while (Serial.available() == 0);
  if (Serial.available() > 0)
  {
    menu = Serial.read();
    switch (menu)
    {
      case 'a':
        {
          Serial.println(calibracion.m);
        }
        break;
      case 'b':
        {
          Serial.println(calibracion.b);
        }
        break;
    }

  }
}

void cambiaCal()
{
  char input[4];
  char menu = "";
  caracterFinProceso();
  delay(100);
  while (Serial.available() == 0)
  {

  }

  if (Serial.available() > 0)
  {
    menu = Serial.read();

    switch (menu)
    {


      case 'a':
        {
          delay(100);
          while ( Serial.available() > 0) Serial.read();
          while (Serial.available() == 0);
          if (Serial.available() > 0)
          {
            for (int i = 0; i < 5; i++)
            {
              input[i] = Serial.read();
              delay(100);
            }
            calibracion.m = atof(input);
            //Serial.println(calibracion.m);
            delay(100);

          }
          while ( Serial.available() > 0) Serial.read();
        }
        break;
      case 'b':
        {
          delay(100);
          while ( Serial.available() > 0) Serial.read();
          while (Serial.available() == 0);

          if (Serial.available() > 0)
          {
            for (int i = 0; i < 5; i++)
            {
              input[i] = Serial.read();
              delay(100);
            }

            calibracion.b = atof(input);
            //Serial.println(calibracion.b);
          }

        }
        break;

    }
  }

  EEPROM.put(0, calibracion.m);
  delay(1000);
  EEPROM.put(4, calibracion.b);
  delay (1000);


}


void seteaIntTransmision()
{
  nTransmSet = intervaloTransmision();
  EEPROM.put(14, nTransmSet);
}


/*SETEA LOS INTERVALOS DE TRANSMISION GSM*/
int intervaloTransmision()
{
  int n;
  char menu;
  while (Serial.available() == 0);
  if (Serial.available() > 0)
  {

    menu = Serial.read();

    switch (menu)
    {
      case 'a'://30 minutos
        {

          if (inter_envio == 15) n = 2;
          if (inter_envio == 30) n = 1;
        }
        break;
      case 'b'://60 minutos
        {
          if (inter_envio == 15) n = 4;
          if (inter_envio == 30) n = 2;
          if (inter_envio == 60) n = 1;
        }
        break;
      case 'c'://120 minutos
        {
          if (inter_envio == 15) n = 8;
          if (inter_envio == 30) n = 4;
          if (inter_envio == 60) n = 2;
          if (inter_envio == 120) n = 1;
        }
        break;
      case 'd'://sin transmision
        {
          n = -1;
        }
        break;

      default:
        {

        }
        break;
    }

  }



  while ( Serial.available() > 0) Serial.read();
  return (n);
}
void cadaCuantoTransmite()
{
  int intervaloTransm;
  EEPROM.get(14, nTransmSet);
  delay (10);
  //nTransmSet=2;
  intervaloTransm = inter_envio * nTransmSet;
  Serial.println(intervaloTransm);
}
/*SETEA LOS INTERVALOS DE ADQUISICION PARA LA FUNCIO cambiaTAcq()*/
void i_acq()
{

  char menu;
  char a;
  while (Serial.available() == 0);
  if (Serial.available() > 0)
  {

    menu = Serial.read();

    switch (menu)
    {
      case 'a':
        {
          Serial.println(F("##"));
          inter_envio = 1;
        }
        break;
      case 'b':
        {
          Serial.println(F("##"));
          inter_envio = 5;
        }
        break;
      case 'c':
        {
          Serial.println(F("##"));
          inter_envio = 15;

        }
        break;
      case 'd':
        {
          Serial.println(F("##"));
          inter_envio = 30;
        }

        break;

      case 'e':
        {
          Serial.println(F("##"));
          inter_envio = 60;
        }
        break;

      case 'f':
        {
          Serial.println(F("##"));
          inter_envio = 120;
        }
        break;


      default:
        {
          //Serial.println (F("comando incorrecto"));
        }
        break;
    }
  }
  delay (100);
  while ( Serial.available() > 0) Serial.read();
  //return (intervalo);
}



/*SIRVE PARA AJUSTAR EL INTERVALO DE TOMA DE DATOS*/
void cambiaTAcq()
{
  i_acq();
  Serial.println(inter_envio);
  EEPROM.put(10, inter_envio);
  delay (10);
  //EEPROM.put(12, fin1);
  delay (10);
  // EEPROM.put(16, init_off);
  delay(10);
  EEPROM.get (10, inter_envio);
  Serial.println(inter_envio);
}



void initmem()//ESTABLECE EL INICIO DE CADA MEMORIA PARA FUNCIONAR EN BUCLE
{
  readeeprom(dispositivo, 0 , (byte*)&ultimadir, sizeof(ultimadir));

  if (ultimadir == 131072 && dispositivo == 80)
  {
    dispositivo = 81;
    ultimadir = 4;
  }
  readeeprom(dispositivo, 0 , (byte*)&ultimadir, sizeof(ultimadir));
  if (ultimadir == 131072 && dispositivo == 81)
  {
    dispositivo = 80;
    ultimadir = 4;
  }
}



void set_alarm(void)/*FUNCION QUE SETEA ALARME EN EL RTC*/
{

  // flags define what calendar component to be checked against the current time in order
  // to trigger the alarm - see datasheet
  // A1M1 (seconds) (0 to enable, 1 to disable)
  // A1M2 (minutes) (0 to enable, 1 to disable)
  // A1M3 (hour)    (0 to enable, 1 to disable)
  // A1M4 (day)     (0 to enable, 1 to disable)
  // DY/DT          (dayofweek == 1/dayofmonth == 0)
  uint8_t flags[5] = { 0, 0, 1, 1, 1 };

  // set Alarm1
  DS3231_set_a1(0, min_acq, hora_acq, 0, flags);

  // activate Alarm1
  DS3231_set_creg(DS3231_INTCN | DS3231_A1IE);
}

void cambia_alarma()//SETEA LA ALARMA SEGUN EL INTERVALO DE ADQUISICION
{
  if (inter_envio < 120)
  {
    min_acq = min_acq + inter_envio;
    if (min_acq > 59)
    {
      min_acq = min_acq - 60;
      hora_acq = hora_acq + 1;
      if (hora_acq > 23) hora_acq = 0;
    }
  }
  if (inter_envio == 120)
  {
    min_acq = 0;
    hora_acq = hora_acq + 2;
    if (hora_acq == 24) hora_acq = 0;
    if (hora_acq == 25) hora_acq = 1;
    if (hora_acq > 25) hora_acq = 2;
  }


}

void establece_alarma()
{
  int min_acq_set;

  switch (inter_envio)
  {
    case 1:
      {
        min_acq_set = min_acq + 1;
        if (min_acq > 59)
        {
          min_acq_set = 0;
          hora_acq = hora_acq + 1;
          if (hora_acq == 24)
            hora_acq = 0;
        }
      }
      break;
    case 5:
      {
        if (min_acq >= 0 && min_acq < 5)
          min_acq_set = 5;
        if (min_acq >= 5 && min_acq < 10)
          min_acq_set = 10;
        if (min_acq >= 10 && min_acq < 15 )
          min_acq_set = 15;
        if (min_acq >= 15 && min_acq < 20)
          min_acq_set = 20;
        if (min_acq >= 20 && min_acq < 25)
          min_acq_set = 25;
        if (min_acq >= 20 && min_acq < 25)
          min_acq_set = 25;
        if (min_acq >= 25 && min_acq < 30)
          min_acq_set = 30;
        if (min_acq >= 30 && min_acq < 35)
          min_acq_set = 35;
        if (min_acq >= 35 && min_acq < 40)
          min_acq_set = 40;
        if (min_acq >= 40 && min_acq < 45)
          min_acq_set = 45;
        if (min_acq >= 45 && min_acq < 50)
          min_acq_set = 50;
        if (min_acq >= 50 && min_acq < 55)
          min_acq_set = 55;
        if (min_acq >= 55 && min_acq < 59)
        {
          min_acq_set = 0;
          hora_acq = hora_acq + 1;
          if (hora_acq == 24)
            hora_acq = 0;
        }
      }
      break;
    case 15:
      {
        if (min_acq >= 0 && min_acq < 15)
          min_acq_set = 15;
        if (min_acq >= 15 && min_acq < 30)
          min_acq_set = 30;
        if (min_acq >= 30 && min_acq < 45 )
          min_acq_set = 45;
        if (min_acq >= 45 && min_acq < 59)
        {
          min_acq_set = 0;
          hora_acq = hora_acq + 1;
          if (hora_acq == 24)
            hora_acq = 0;
        }

      }
      break;
    case 30:
      {
        if (min_acq >= 0 && min_acq <= 30)
          min_acq_set = 30;
        if (min_acq >= 30 && min_acq <= 59)
        {
          min_acq_set = 0;
          hora_acq = hora_acq + 1;
          if (hora_acq == 24)
            hora_acq = 0;
        }
      }
      break;
    case 60:
      {
        min_acq_set = 0;
        hora_acq = hora_acq + 1;
        if (hora_acq == 24)
          hora_acq = 0;
      }
      break;
    case 120:
      {
        min_acq_set = 0;
        hora_acq = hora_acq + 2;
        if (hora_acq > 23)
          hora_acq = 0;
      }


      break;
  }
  min_acq = min_acq_set;
}


void tomahora()
{
  //char buff[BUFF_MAX];
  //unsigned long now = millis();
  //byte segundo;
  struct ts t;
  DS3231_get(&t);
  hora_acq = t.hour;
  min_acq = t.min;
  seg_acq = t.sec;
}
void muestraAlarma()
{
  Serial.println(hora_acq);
  Serial.println(min_acq);
  Serial.println(seg_acq);
}


void carga_calibracion() {

  EEPROM.get(0, calibracion);
  Serial.print(F("Pendiente calibracion: "));
  Serial.println(calibracion.m);
  Serial.print(F("Ordenada de origen: "));
  Serial.println(calibracion.b);
}

void cargaTimer() {
  EEPROM.get (8, hora_acq);
  EEPROM.get (9, min_acq);
  EEPROM.get (10, inter_envio);

  Serial.println(inter_envio);

  //EEPROM.get(12, fin1);
  EEPROM.get(14, nTransmSet);
  //EEPROM.get(16, init_off);
  //Serial.println(init_off);
}


void verifSensor()
{
  sensor_profundidad();
  if (var == -1000 ||  var == -1001 || var == -1002)
  {
    Serial.println(F("Fallo sensor"));
  }
  else
  {
    Serial.println(F("Sensor conectado"));
  }
}

void inicializacion() {

  /*PINES INTERRUPCION*/
  pinMode (2, INPUT);
  pinMode (3, INPUT_PULLUP);

  /*TEST INICIAL DEL SENSOR*/
 pinMode(5, OUTPUT);
  //digitalWrite (5, HIGH);
  //delay(100);
  digitalWrite (5, HIGH);
  Serial.println(F("Inicializando sensor..."));
  pinMode(pincontrol, OUTPUT);
  digitalWrite(pincontrol, HIGH);
  verifSensor();
  digitalWrite (pincontrol, LOW);

  /*FIN TEST SENSOR*/

  /*ENCIENDE 100MS EL GSM PARA COMPROBACION*/
  pinMode(5, OUTPUT);
  //digitalWrite (5, HIGH);
  //delay(100);
  digitalWrite (5, HIGH);
  pinMode (12, OUTPUT);
  //pinMode(rtcpin, OUTPUT);
  digitalWrite (7, LOW);
  digitalWrite (8, LOW);  
  //pinMode(7, INPUT);
  //pinMode(8, INPUT);
  /*INICIA PROTECCION DE GRABACION EN MEMORIA*/
  digitalWrite (wp, HIGH);

  /* ENCIENDE RTC*/
  //digitalWrite (rtcpin, HIGH);
  delayMicroseconds(500);
  /*CARGA VALOR DE ULTIMA DIRECCION DE MEMORIA EEPROM Y DEJA LISTO PARA GRABAR SIGUIENTE*/
  initmem();
  /*CARGA LOS VALORES DE CALIBRACION SETEADOS EN EL MENU*/
  carga_calibracion();
  /*CARGA CONFIGURACION TIMER*/
  DS3231_init(DS3231_INTCN);
  DS3231_clear_a1f();
  cargaTimer();
  /*CARGA DIRECCION SERVIDOR EN MEMORIA*/
  leeServer();
  direccion1 = direccion1 + direccion3 + direccion2;
  //Serial.println(direccion1);
  delay(1000);
  r_serial.end();
  SIM900.end();
  Serial.end();
  /*PONE LOS PINES DE COMUNICACION SERIAL COMO ENTRADA, ALTA IMPEDANCIA*/
  pinMode(0, INPUT);
  pinMode(1, INPUT);
  /*PREPARA PARA SLEEP*/
  dirmemo = ultimadir;
  nro_pagina = 0;
  tomahora();
  establece_alarma();
  set_alarm();
}

void entraconf()/*FUNCION VACIA PARA ACTIVAR EL FLAG QUE INICIA MENU DE CONFIGURACION*/
{

  despiertaMenu = !despiertaMenu;
}

void despertador()/*FUNCION VACIA PARA ACTIVAR EL FLAG QUE INICIA TOMA DE DATOS*/
{
  despiertaACK = !despiertaACK;
}

void setup() {
  /*CONFIGURA COMUNICACIONES*/
  Serial.begin(19200);
  Wire.begin();
  r_serial.begin(9600);
  inicializacion();
  attachInterrupt(digitalPinToInterrupt(2), entraconf, FALLING);
  attachInterrupt(digitalPinToInterrupt(3), despertador, FALLING);
}


void loop()
{
  /*ENTRA A DORMIR HASTA QUE DESPIERTA A LA HORA PREFIJADA*/
  LowPower.powerDown(SLEEP_FOREVER, ADC_OFF, BOD_OFF);
  if (DS3231_triggered_a1() && despiertaACK == HIGH)
  {
    DS3231_clear_a1f();
    tomahora();
    cambia_alarma();
    set_alarm();
    duerme = HIGH;
    tack = HIGH;
    if ( nTransmSet > -1)
    {
      nTransmAcc++;
      nro_pagina++;
      if (nTransmAcc == nTransmSet)
      {
        tenv = HIGH;
      }
    }
  }
  if (despiertaMenu == HIGH)
  {
    m_config = HIGH;
  }
  /*ENTRA A MENU CONFIGURACION CONEL FLAG m_config*/
  if (m_config == HIGH)
  {
    detachInterrupt(digitalPinToInterrupt(3));
    detachInterrupt(digitalPinToInterrupt(2));
    digitalWrite (5, LOW);
    r_serial.begin(9600);
    Serial.begin(19200);
    SIM900.begin(19200); //Configura velocidad del puerto serie para el SIM900
    menuConfiguracion();// Entra al menu de configuracion
    digitalWrite (5, HIGH);
    duerme = LOW;
    tack = LOW ;
    tenv = LOW ;
    nTransmAcc = 0;
    r_serial.end();
    SIM900.end();
    Serial.end();
    pinMode(0, INPUT);
    pinMode(1, INPUT);
    DS3231_clear_a1f(); //puse el clear alarma
    tomahora();
    establece_alarma();
    set_alarm();
    digitalWrite (pincontrol, LOW);
    //pinMode(10,INPUT);
    //pinMode(11,INPUT);
    attachInterrupt(digitalPinToInterrupt(2), entraconf, FALLING);
    attachInterrupt(digitalPinToInterrupt(3), despertador, FALLING);
    m_config = LOW;
    despiertaMenu = LOW;
    despiertaACK = LOW;
  }

  /*LEE EL/LOS SENSOR/ES Y GRABA LOS DATOS EN UNA PAGINA DE MEMORIA*/
  if (tack == HIGH)
  {
    r_serial.begin(9600);
    r_serial.listen();
    graba_pagina();
    r_serial.end();
    delayMicroseconds(1000);
    //nro_pagina++;
    tack = LOW;
    duerme = LOW;
    despiertaACK = LOW;
  }
  /*ENVIA LOS DATOS POR GSM*/
  if (tenv == HIGH)
  {
    if (readVcc() > 4750)
    {
      Serial.begin(19200);
      //Serial.println(nro_pagina);
      digitalWrite (5, LOW);
      SIM900.begin(19200);
      SIM900.listen();
      GSMOn = power_on();
      if (GSMOn == HIGH)
      {
        if (iniciar() == 1)
        {
          PeticionHttp();
          enviarAT("AT+CIPCLOSE", "CLOSE OK", 10000); //Cerramos la conexion
          enviarAT("AT+CIPSHUT", "OK", 10000); //Cierra el contexto PDP del GPRS
        }
      } else if (GSMOn == LOW)
      {
        GSMOn = HIGH;
      }
      Serial.end();
      power_off();
      tenv = LOW;
      duerme = LOW;
      initmem();
      dirmemo = ultimadir;
      nro_pagina = 0;
      SIM900.end();
      m_config = LOW;
      digitalWrite (5, HIGH);
      nTransmAcc = 0;
    digitalWrite (7, LOW);
    digitalWrite (8, LOW);
    //pinMode(7, INPUT);
    //pinMode(8, INPUT);
    
    }
  }
}
