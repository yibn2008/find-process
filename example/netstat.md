# Get pid on different platform

## Mac OSX (darwin)

```sh
$ netstat -anv
Active Internet connections (including servers)
Proto Recv-Q Send-Q  Local Address          Foreign Address        (state)     rhiwat shiwat    pid   epid
tcp4       0      0  10.16.43.243.55669     10.20.13.51.8000       ESTABLISHED 131346 131768    422      0
tcp4       0      0  10.16.43.243.55663     140.205.133.118.80     CLOSE_WAIT  131072 131100  36843      0
tcp4       0      0  10.16.43.243.55661     183.136.138.140.80     ESTABLISHED 131072 131328  40517      0
tcp46      0      0  *.443                  *.*                    LISTEN      131072 131072  61044      0
tcp46      0      0  *.8888                 *.*                    LISTEN      131072 131072  61044      0
```

## Windows (win32)

```sh
C:\Users\xxx>netstat -ano

活动连接

  协议  本地地址          外部地址        状态           PID
  TCP    0.0.0.0:80             0.0.0.0:0              LISTENING       2288
  TCP    0.0.0.0:135            0.0.0.0:0              LISTENING       736
  TCP    0.0.0.0:443            0.0.0.0:0              LISTENING       2288
  TCP    0.0.0.0:445            0.0.0.0:0              LISTENING       4
  TCP    0.0.0.0:5357           0.0.0.0:0              LISTENING       4
  TCP    0.0.0.0:49152          0.0.0.0:0              LISTENING       420
  TCP    0.0.0.0:49153          0.0.0.0:0              LISTENING       812
  TCP    0.0.0.0:49154          0.0.0.0:0              LISTENING       896
  TCP    0.0.0.0:49155          0.0.0.0:0              LISTENING       520
  TCP    0.0.0.0:49164          0.0.0.0:0              LISTENING       536
  TCP    10.211.55.6:139        0.0.0.0:0              LISTENING       4
  TCP    10.211.55.6:50506      183.136.138.140:80     CLOSE_WAIT      3020
  TCP    10.211.55.6:50510      100.67.1.9:80          TIME_WAIT       0
  TCP    127.0.0.1:4012         0.0.0.0:0              LISTENING       672
  TCP    127.0.0.1:4013         0.0.0.0:0              LISTENING       672
```

## Ubuntu (linux)

```sh
$ sudo netstat -tunlp
[sudo] password for xxx:
Active Internet connections (only servers)
Proto Recv-Q Send-Q Local Address           Foreign Address         State       PID/Program name
tcp        0      0 127.0.0.1:3306          0.0.0.0:*               LISTEN      830/mysqld
tcp        0      0 0.0.0.0:80              0.0.0.0:*               LISTEN      1668/nginx
tcp        0      0 0.0.0.0:21              0.0.0.0:*               LISTEN      632/vsftpd
tcp        0      0 0.0.0.0:32223           0.0.0.0:*               LISTEN      492/sshd
tcp        0      0 127.0.0.1:9000          0.0.0.0:*               LISTEN      1705/php-fpm.conf)
tcp6       0      0 :::32223                :::*                    LISTEN      492/sshd
tcp6       0      0 :::8228                 :::*                    LISTEN      18214/squid3
udp        0      0 0.0.0.0:49983           0.0.0.0:*                           18214/squid3
udp        0      0 115.29.18.179:123       0.0.0.0:*                           1103/ntpd
udp        0      0 10.122.77.193:123       0.0.0.0:*                           1103/ntpd
udp        0      0 127.0.0.1:123           0.0.0.0:*                           1103/ntpd
udp        0      0 0.0.0.0:123             0.0.0.0:*                           1103/ntpd
udp6       0      0 :::123                  :::*                                1103/ntpd
udp6       0      0 :::39072                :::*                                18214/squid3
```
