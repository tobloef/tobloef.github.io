---
title: 'CyberCamp Individual CTF Quals 2017 Writeup'
pubDate: 2017-10-07
layout: '../../../layouts/BlogLayout.astro'
aliases: ["/ctf/cybercamp-ctf-2017"]
---

This weekend I had a bit of time to participate in the [CyberCamp Individual CTF Quals](https://cybercamp.es/en/competitions/individual_ctf). The CTF was open the entire week, but you only had 8 hours to complete as many challenges as you could once you started the challenge. This is my writeup of the challenges I solved.

## It is not Caesar

![Objective 1](./assets/objective1.jpg)

In the image above we see three things of note. First of all we have the piece of ciphertext `ESNTOTGCESLDUMOHIESLF:QACAIEOS`. We also have the string `6x5` and the word `BLANCO`. Based on the challenge's title, I'm guessing that this is some kind of cipher. `6x5` seems to be dimensions for a grid and `BLANCO` could be a key. After looking a bit at different transposition ciphers I found one that looked promising, the columnar transposition cipher.

The columnar transposition cipher works by arranging the text you want to encrypt in columns with the key at the top, just like this:

```
"This is the text you want to encrypt"
Key: Blanco, arranged top to bottom, left ro right.

| B | L | A | N | C | O |
-------------------------
| T | S | E | U | T | R |
| H | T | X | W | O | Y |
| I | H | T | A | E | P |
| S | E | Y | N | N | T |
| I | T | O | T | C |   |
```

You then sort the columns alphabetically based on the key and read the ciphertext top to bottom, left to right. This would result in something like this, in the example:

```
| A | B | C | L | N | O |
-------------------------
| E | T | T | S | U | R |
| X | H | O | T | W | Y |
| T | I | E | H | A | P |
| Y | S | N | E | N | T |
| O | I | C | T | T |   |

EXTYOTHISITOENCSTHETUWANTRYPT
```

If we assume that this approach have been used on the ciphertext for the challenge, all that is needed to find the original text is to arrange the letters in a 6x5 grid, use the letters of the key `BLANCO` sorted alphabetically and then reorder the columns so the key is `BLANCO` once again.

```
ESNTOTGCESLDUMOHIESLF:QACAIEOS

| A | B | C | L | N | O |
-------------------------
| E | T | L | H | F | A |
| S | G | D | I | : | I |
| N | C | U | E | Q | E |
| T | E | M | S | A | O |
| O | S | O | L | C | S |

Sorting key back to BLANCO

| B | L | A | N | C | O |
-------------------------
| T | H | E | F | L | A |
| G | I | S | : | D | I |
| C | E | N | Q | U | E |
| E | S | T | A | M | O |
| S | L | O | C | O | S |

Read the grid left to right, top to bottom.
THE FLAG IS: DICENQUEESTAMOSLOCOS
```

**FLAG:** `DICENQUEESTAMOSLOCOS`

## Keywords
In this challenge we were given an image of a hard drive in form of a .aff file, with the instruction to find a secret phrase used by a criminal organization to communicate. As a hint we were also told that the person whose hard drive was imaged often searched for the phrase on his computer. I would upload the .aff file, but it's 4.5 GB.

I started off by mounting the .aff file on my computer with a tool called [OSFMount](https://www.osforensics.com/tools/mount-disk-images.html). I knew I probably had to take a look at the registry of the user to view his Windows Explorer search history, so I opened up the NTUSER.DAT file found in the user's home directory, with a tool called [Registry Viewer](https://www.gaijin.at/en/dlregview.php). Under `Software\Microsoft\Windows\CurrentVersion\Explorer\WordWheelQuery` we can see one of the searches, which probably contain the flag.

![Objective 2](./assets/objective2.png)

**FLAG:** `El YEPA-YEPA`

## Transfer with terrible consequences
The premise of this challenge is a bit strange, but it boils down to having a partial hash with 6 unknown characters, `50afXXXXXX6351475e54bf6eb2c96f2b`, and the first and last two digits of a 8 character password, `q` and `oq`. We don't know the type of hash. The flag of the challenge is the hash and the matching password formatted like `hash-password`.

I first used a tool called [hashid](https://github.com/psypanda/hashID) to list the possible types of hash this could be. Since ´X´ isn't one of the 16 hex characters, I replaced the six X's with 0's.

```bash
$ hashid 50af0000006351475e54bf6eb2c96f2b
Analyzing '50af0000006351475e54bf6eb2c96f2b'
[+] MD2
[+] MD5
[+] MD4
[+] Double MD5
[+] LM
[+] RIPEMD-128
[+] Haval-128
[+] Tiger-128
[+] Skein-256(128)
[+] Skein-512(128)
[+] Lotus Notes/Domino 5
[+] Skype
[+] Snefru-128
[+] NTLM
[+] Domain Cached Credentials
[+] Domain Cached Credentials 2
[+] DNSSEC(NSEC3)
[+] RAdmin v2.x
```


Now that I knew some of the possible types of hashes, I created a script to generate all the possible passwords and check whether the hash of the password matches the partial hash. The first type of hash I tried was MD5 but that didn't work, so I tried MD4 which turned out to be correct.

```python
import hashlib
import string
import itertools

alphabet = string.ascii_lowercase + string.digits
partialHash = "50afXXXXXX6351475e54bf6eb2c96f2b"

print("Generating combinations...")

combinations = ["q" + ''.join(i) + "oq" for i in itertools.product(alphabet, repeat = 5)]

combinationsCount = len(combinations)
print("Generated " + str(combinationsCount) + " combinations.")

print("Cracking...")

for i, combination in enumerate(combinations):
    hash = hashlib.new("md4", combination.encode("utf-8")).hexdigest()
    newPartial = hash[0:4] + "XXXXXX" + hash[10:]
    if (i%1000000 == 0 or i == combinationsCount - 1):
        print("{0:.2f}".format(100/combinationsCount * i) + "% " + str(i) + ": " + combination + " " + hash + " " + newPartial + " " + partialHash)
    if (newPartial == partialHash):
        print("Combination: " + combination)
        print("Hash: " + hash)
        break
```

After waiting for a few minutes I got the full hash and the password used.

**FLAG:** `50affc9dcf6351475e54bf6eb2c96f2b-q5ib44oq`

## Without collaboration
[Download the .pcap file](/cybercamp-ctf-2017/objective5.pcap)

In this challenge we have a .pcap file with a lot of captured packets and instructions to find a sensitive file that was accessed over the network.

As I usually do, I start off by opening the file in a tool called [NetworkMiner](http://www.netresec.com/?page=NetworkMiner) to quickly get an overview of the traffic. There's a lot of hosts, but most of them are various web servers. If we sort the hosts by hostname, we can see all the local hosts at the top, since they don't have any hostnames. After looking through the hosts on the network I picked one that looked interesting and used the IP to create a Wireshark filter to show packets originating from this host:

`ip.src == 192.168.47.192`

![Wireshark filtered](./assets/objective5.png)

We can see a bunch of ICMP packets sent from the host. Some of the packets contain parts of a error message, so it seems like some sort of exploit was used to make the host respond with an error containing the path and contents of a sensitive file. This is the data of most interesting packet:

```
8783	49.040357	192.168.47.192	192.168.47.191	ICMP	81
Echo (ping) request  id=0x0001, seq=3682/25102, ttl=255 (no response found!)

0000   6d 6f 72 65 20 41 64 70 61 73 73 2e 74 78 74 0a  more Adpass.txt.
0010   47 68 6f 73 74 49 6e 54 68 65 50 69 6e 67 73 0d  GhostInThePings.
0020   0a 0d 0a 43 3a 5c 3e                             ...C:\>
```

**Flag:** `GhostInThePings`

## Elephant memory
In this challenge we were given a memory dump of a PC and the instructions to look for the user credentials for the owner's PayPal account. I used [Volatility](http://www.volatilityfoundation.org/) to solve this challenge, which is a pretty nice memory forensics tool.

First I had to find out what kind of system the memory dump was from, since I needed to know what profile to use with Volatility.

```bash
$ volatility -f objective8.raw imageinfo

INFO    : volatility.debug    : Determining profile based on KDBG search...
Suggested Profile(s) : Win7SP1x86_23418, Win7SP0x86, Win7SP1x86
AS Layer1 : IA32PagedMemoryPae (Kernel AS)
AS Layer2 : FileAddressSpace (/home/hacker/Downloads/objective8.raw)
PAE type : PAE
DTB : 0x185000L
KDBG : 0x82b7bc28L
Number of Processors : 2
Image Type (Service Pack) : 1
KPCR for CPU 0 : 0x82b7cc00L
KPCR for CPU 1 : 0x807ca000L
KUSER_SHARED_DATA : 0xffdf0000L
Image date and time : 2017-08-02 07:54:40 UTC+0000
Image local date and time : 2017-08-02 09:54:40 +0200
```

It turned out to be the `Win7SP1x86` profile. To then get an overview of what is going on on the system, I took a look a look at the processes runing on the system when the image was created.

```bash
$ volatility -f objective8.raw --profile=Win7SP1x86 pslist

Offset(V)  Name                    PID   PPID   Thds     Hnds   Sess  Wow64 Start
---------- -------------------- ------ ------ ------ -------- ------ ------ ------------------------------
0x848418e8 System                    4      0     89      382 ------      0 2017-07-28 08:27:06 UTC+0000
0x85b9c428 smss.exe                284      4      2       30 ------      0 2017-07-28 08:27:06 UTC+0000
0x868f1c48 csrss.exe               368    348      9      553      0      0 2017-07-28 08:27:07 UTC+0000
0x8692a200 wininit.exe             400    348      3       76      0      0 2017-07-28 08:27:07 UTC+0000
0x85f5a030 csrss.exe               416    408     14      643      1      0 2017-07-28 08:27:07 UTC+0000
0x86bb07c8 services.exe            480    400     21      249      0      0 2017-07-28 08:27:07 UTC+0000
0x86bb3d18 winlogon.exe            488    408      3      113      1      0 2017-07-28 08:27:07 UTC+0000
0x86bc7030 lsass.exe               524    400     10      624      0      0 2017-07-28 08:27:07 UTC+0000
0x86b911a8 lsm.exe                 532    400     11      165      0      0 2017-07-28 08:27:07 UTC+0000
0x86c55030 svchost.exe             636    480     11      376      0      0 2017-07-28 08:27:08 UTC+0000
0x86c866b8 vmacthlp.exe            696    480      3       55      0      0 2017-07-28 08:27:08 UTC+0000
0x86c8dc88 svchost.exe             740    480      9      316      0      0 2017-07-28 08:27:08 UTC+0000
0x86cb4030 svchost.exe             824    480     22      515      0      0 2017-07-28 08:27:08 UTC+0000
0x86cda898 svchost.exe             868    480     15      331      0      0 2017-07-28 08:27:08 UTC+0000
0x86ce2d40 svchost.exe             900    480     53     1346      0      0 2017-07-28 08:27:08 UTC+0000
0x86d3f880 svchost.exe            1052    480     16      672      0      0 2017-07-28 08:27:08 UTC+0000
0x86d55450 svchost.exe            1132    480     23      532      0      0 2017-07-28 08:27:08 UTC+0000
0x86de8648 spoolsv.exe            1240    480     14      342      0      0 2017-07-28 08:27:08 UTC+0000
0x86dfc358 svchost.exe            1288    480     21      343      0      0 2017-07-28 08:27:08 UTC+0000
0x86e38cc8 taskhost.exe           1364    480     10      238      1      0 2017-07-28 08:27:09 UTC+0000
0x86e73ab8 dwm.exe                1468    868      3       77      1      0 2017-07-28 08:27:09 UTC+0000
0x86e8d030 explorer.exe           1532   1448     46     1296      1      0 2017-07-28 08:27:09 UTC+0000
0x86ede708 VGAuthService.         1576    480      3       84      0      0 2017-07-28 08:27:09 UTC+0000
0x86f1f030 vmtoolsd.exe           1724    480      9      303      0      0 2017-07-28 08:27:09 UTC+0000
0x86f6d370 vmtoolsd.exe           1884   1532      7      264      1      0 2017-07-28 08:27:09 UTC+0000
0x86fd4928 WmiPrvSE.exe           1156    636     10      228      0      0 2017-07-28 08:27:10 UTC+0000
0x86ed9030 dllhost.exe            1308    480     14      197      0      0 2017-07-28 08:27:10 UTC+0000
0x8702cc48 msdtc.exe              2096    480     12      148      0      0 2017-07-28 08:27:11 UTC+0000
0x86eea1a0 SearchIndexer.         2380    480     14      675      0      0 2017-07-28 08:27:15 UTC+0000
0x86e4a030 sppsvc.exe             2940    480      6      159      0      0 2017-07-28 08:28:39 UTC+0000
0x85da1030 svchost.exe            3396    480     13      162      0      0 2017-07-28 08:29:10 UTC+0000
0x85d3d030 svchost.exe            3456    480      9      319      0      0 2017-07-28 08:29:10 UTC+0000
0x850bed40 mspaint.exe            2896   1532      6      121      1      0 2017-07-28 08:57:11 UTC+0000
0x8708e9f8 svchost.exe            3084    480      7      109      0      0 2017-07-28 08:57:11 UTC+0000
0x84a19588 wordpad.exe            1040   1532      4      127      1      0 2017-07-28 08:58:01 UTC+0000
0x84fb7420 mstsc.exe              2524   1532      9      418      1      0 2017-07-28 08:58:10 UTC+0000
0x84dd8d40 cmd.exe                1372   1532      1       19      1      0 2017-07-28 08:58:55 UTC+0000
0x84f41030 conhost.exe            3696    416      2       54      1      0 2017-07-28 08:58:55 UTC+0000
0x84db0488 GoogleCrashHan         4024   2716      5       93      0      0 2017-07-28 09:04:25 UTC+0000
0x8702d418 taskhost.exe           5900    480      5       96      1      0 2017-07-28 09:48:15 UTC+0000
0x849e83a8 iexplore.exe           4600   1532     14      391      1      0 2017-07-28 10:20:06 UTC+0000
0x84e32c20 iexplore.exe           5352   4600     21      690      1      0 2017-07-28 10:20:06 UTC+0000
0x87d90030 KeePass.exe            1336    212      9      498      1      0 2017-07-28 10:21:27 UTC+0000
0x8505f030 firefox.exe            3312   1532     55      821      1      0 2017-07-28 11:14:20 UTC+0000
0x84e80990 taskmgr.exe            3128   6128      8      121      1      0 2017-08-01 06:20:04 UTC+0000
0x84f14258 chrome.exe             5952   1532     40      938      1      0 2017-08-01 08:47:50 UTC+0000
0x850f5538 chrome.exe             5860   5952      8       80      1      0 2017-08-01 08:47:50 UTC+0000
0x850ce030 chrome.exe             5004   5952      2       58      1      0 2017-08-01 08:47:50 UTC+0000
0x84c3d030 chrome.exe              352   5952      7      201      1      0 2017-08-01 08:47:50 UTC+0000
0x84c50030 chrome.exe             2724   5952     14      211      1      0 2017-08-01 08:47:51 UTC+0000
0x84aa8810 chrome.exe             4064   5952     13      271      1      0 2017-08-01 08:48:06 UTC+0000
0x84f933d0 taskhost.exe           1324    480      8      157      0      0 2017-08-02 07:53:54 UTC+0000
0x85058030 notepad.exe            4596   1532      1       63      1      0 2017-08-02 07:54:07 UTC+0000
0x84e98938 SearchProtocol         2656   2380      8      281      0      0 2017-08-02 07:54:07 UTC+0000
0x84fc6030 SearchFilterHo         3560   2380      5      101      0      0 2017-08-02 07:54:08 UTC+0000
0x84cd8268 cmd.exe                5456   1724      0 --------      0      0 2017-08-02 07:54:40 UTC+0000
0x84aa3348 conhost.exe            5152    368      0 --------      0      0 2017-08-02 07:54:40 UTC+0000
0x84a166b0 ipconfig.exe           5024   5456      0 --------      0      0 2017-08-02 07:54:40 UTC+0000
```

There's a bunch of processes running, some of them are probably there as red herrings. I saw that Notepad was open and wanted to take a look at what was written in it, so I used the ´editbox´ module for Volatility to view the contents of all open editable boxes.

```bash
$ volatility -f objective8.raw --profile=Win7SP1x86 editbox

Wnd Context       : 1\WinSta0\Default
Process ID        : 4596
ImageFileName     : notepad.exe
IsWow64           : No
atom_class        : 6.0.7601.17514!Edit
value-of WndExtra : 0x368eb0
nChars            : 69
selStart          : 65
selEnd            : 65
isPwdControl      : False
undoPos           : 46
undoLen           : 1
address-of undoBuf: 0x369110
undoBuf           : s
-------------------------
Paypal Account: pepemartineza@outlook.com

Password at lastpass
```

We now know the PayPal email and that the password is in the password manager LastPass. I have previously used a [great Volatility plugin](https://techanarchy.net/2016/10/extracting-lastpass-site-credentials-from-memory/) to extract LastPass credentials in memory, so the rest was pretty easy.

```bash
$ volatility --plugins=/usr/share/volatility/contrib/plugins -f objective8.raw --profile=Win7SP1x86 lastpass

Searching for LastPass Signatures
Found pattern in Process: firefox.exe (3312)
Found pattern in Process: firefox.exe (3312)
Found pattern in Process: chrome.exe (2724)
Found pattern in Process: chrome.exe (2724)
Found pattern in Process: chrome.exe (2724)
Found pattern in Process: chrome.exe (2724)
Found pattern in Process: chrome.exe (2724)
Found pattern in Process: chrome.exe (2724)
Found pattern in Process: chrome.exe (2724)
Found pattern in Process: chrome.exe (2724)
Found pattern in Process: chrome.exe (2724)
Found pattern in Process: chrome.exe (2724)
Found pattern in Process: chrome.exe (4064)

Found LastPass Entry for paypal.com,paypal.com,paypal-search.com
UserName: Unknown
Pasword: Birds_fly_cats_not
```

We can see the password for the user's PayPal account, which is the flag for the challenge.

**FLAG:** `Birds_fly_cats_not`

## Conclusion
And that's it. Pretty fun CTF, even though I'm a bit sad I didn't get time to really dig into the layers of the final forensics challenge, "The Lord of DFIR".

Feel free to follow me on [Twitter](https://twitter.com/tobloef), where I sometimes post about my projects.

Thanks for reading!