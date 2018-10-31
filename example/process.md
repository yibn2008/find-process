# Get process info on different platform

## MacOSX (darwin)

```sh
$ ps -ax -ww -o pid,ppid,uid,gid,args
  PID  PPID   UID   GID ARGS
    1     0     0     0 /sbin/launchd
   44     1     0     0 /usr/sbin/syslogd
   45     1     0     0 /usr/libexec/UserEventAgent (System)
   47     1     0     0 /usr/libexec/kextd
   48     1     0     0 /System/Library/Frameworks/CoreServices.framework/Versions/A/Frameworks/FSEvents.framework/Versions/A/Support/fseventsd
   50     1     0     0 /opt/cisco/anyconnect/bin/vpnagentd -execv_instance
   53     1    55    55 /System/Library/CoreServices/appleeventsd --server
   54     1     0     0 /usr/libexec/configd
   56     1     0     0 /System/Library/CoreServices/powerd.bundle/powerd
   61     1     0     0 /usr/libexec/airportd
   63     1     0     0 /usr/libexec/warmd
   64     1     0     0 /System/Library/Frameworks/CoreServices.framework/Frameworks/Metadata.framework/Support/mds
```

## Ubuntu (linux)

```
```

## Windows7 (win32)

```sh
C:\> WMIC path win32_process get Name,Processid,ParentProcessId,Commandline
CommandLine                                                                                                                                                                                                        Name                   ParentProcessId  ProcessId
                                                                                                                                                                                                                   System Idle Process    0                0
                                                                                                                                                                                                                   System                 0                4
                                                                                                                                                                                                                   smss.exe               4                276
                                                                                                                                                                                                                   csrss.exe              356              364
                                                                                                                                                                                                                   wininit.exe            356              420
                                                                                                                                                                                                                   csrss.exe              412              432
                                                                                                                                                                                                                   winlogon.exe           412              484
                                                                                                                                                                                                                   services.exe           420              520
                                                                                                                                                                                                                   lsass.exe              420              536
                                                                                                                                                                                                                   lsm.exe                420              544
                                                                                                                                                                                                                   svchost.exe            520              656
                                                                                                                                                                                                                   svchost.exe            520              736
                                                                                                                                                                                                                   svchost.exe            520              812
                                                                                                                                                                                                                   svchost.exe            520              868
                                                                                                                                                                                                                   svchost.exe            520              896
                                                                                                                                                                                                                   svchost.exe            520              1060
                                                                                                                                                                                                                   svchost.exe            520              1164
                                                                                                                                                                                                                   spoolsv.exe            520              1272
                                                                                                                                                                                                                   svchost.exe            520              1316
"taskhost.exe"                                                                                                                                                                                                     taskhost.exe           520              1436
                                                                                                                                                                                                                   svchost.exe            520              1540
                                                                                                                                                                                                                   coherence.exe          520              1624
                                                                                                                                                                                                                   prl_tools_service.exe  520              1668
                                                                                                                                                                                                                   coherence.exe          1624             1692
                                                                                                                                                                                                                   pcas.exe               520              1740
                                                                                                                                                                                                                   prl_tools.exe          1668             1760
                                                                                                                                                                                                                   svchost.exe            520              1936
                                                                                                                                                                                                                   dllhost.exe            520              1968
                                                                                                                                                                                                                   QQProtect.exe          520              1996
                                                                                                                                                                                                                   TBSecSvc.exe           520              372
                                                                                                                                                                                                                   wwbizsrv.exe           520              672
                                                                                                                                                                                                                   sppsvc.exe             520              2228
                                                                                                                                                                                                                   svchost.exe            520              2360
                                                                                                                                                                                                                   msdtc.exe              520              2644
C:\Users\yibn\AppData\Roaming\TaobaoProtect\TaobaoProtect.exe                                                                                                                                                      TaobaoProtect.exe      372              3020
"C:\Windows\system32\Dwm.exe"                                                                                                                                                                                      dwm.exe                868              3504
C:\Windows\Explorer.EXE                                                                                                                                                                                            explorer.exe           3496             3528
"C:\Program Files\Parallels\Parallels Tools\prl_cc.exe"                                                                                                                                                            prl_cc.exe             3528             3616
                                                                                                                                                                                                                   SearchIndexer.exe      520              2256
                                                                                                                                                                                                                   wmpnetwk.exe           520              2208
\??\C:\Windows\system32\conhost.exe                                                                                                                                                                                conhost.exe            432              2004
"C:\Users\yibn\AppData\Local\GitHub\PortableGit_c7e0cbde92ba565cb218a521411d0e854079a28c\usr\bin\ssh-agent.exe"                                                                                                    ssh-agent.exe          2200             2132
"C:\Program Files\Atlassian\SourceTree\tools\putty\pageant.exe"                                                                                                                                                    pageant.exe            2824             2860
"C:\Windows\system32\cmd.exe"                                                                                                                                                                                      cmd.exe                3528             2668
\??\C:\Windows\system32\conhost.exe                                                                                                                                                                                conhost.exe            432              2304
"C:\Windows\System32\WindowsPowerShell\v1.0\Powershell.exe" -NoExit -ExecutionPolicy Unrestricted -File "C:\Users\yibn\AppData\Local\GitHub\PoshGit_869d4c5159797755bc04749db47b166136e59132\profile.example.ps1"  powershell.exe         2372             2988
\??\C:\Windows\system32\conhost.exe                                                                                                                                                                                conhost.exe            432              3896
C:\Windows\explorer.exe /factory,{75dff2b7-6936-4c06-a8bb-676a7b00b24b} -Embedding                                                                                                                                 explorer.exe           656              2836
"C:\Program Files\Sublime Text 2\sublime_text.exe" "C:\Users\yibn\Documents\GitHub\workbench\x.txt"                                                                                                                sublime_text.exe       2836             2956
```
