import { useEffect, useRef, useState } from "react";
import type { ReactNode, Dispatch, SetStateAction } from "react";
import { supabase } from "./lib/supabase";
const AVENROOS_ICON = "data:image/png;base64,aVZCT1J3MEtHZ29BQUFBTlNVaEVVZ0FBQUVBQUFBQkFDQVlBQUFDcWFYSGVB
QUFYVVVsRVFWUjQyczJiCmFaQmMxM1hmZitmYzkxNVA5OHdBTTlnMGhFZ1FC
TGhMQUVpSUZpbExzaWpKTnJWUmlsVVZXWW9qV3pKRApPU25GVlU1Vktva1RX
WFRLa1NzcEw0bExLbHRPWXRGV3BTeGJwaEpyTVUzQk1zVkZKc0hGRkVrUnBF
eWEKRzdnQ0lEbVl3ZlJNTCsvZWt3L3Z2ZTc3WGpjY1NwL1NOVjA5M1crNzk5
eHovdWQvbGd1djdpVjJIYW9DCnd2K2ZMeFd3NjY1VCt3R0hLUC9QaVJ1SVlP
WDNPVmpZdXYvQzF2eStyWXR6VzlLa0ZaekpUQTdrQ1dzSgo1TUJDRHBmT0l1
Zk93WXM5T05LRDBFL3NyVnR6eVdaU3QrRXpwZCtIQkx5cURJTXA1SWkyQk1E
SzU5bGcKWUttRjBHdTM4cVBIVjhKTEpPUTU1SG1PdGxON0piZjhwWjVidi8z
b3laWGp4NDhlQTdvQVppWWl4YTErCmFBRVlpQU1MQUpzM24vTTdCN2EvL3FM
MnhyNHRtYjF1UHRYZE01azdNekZkU015RVBCU2pkaW1Ra0Jpawpsa3VhYjJC
T0dLWWRiS2lXNlVBSWdnYUQ0REZSVEJSUlFLUWNyaUFvcUdBVzhCamVLV0pp
UStjSUlwZ0oKb3RnUTJSaWd4L3RtankwbjJkMFBEL1hCZjNQYmtTZGZmbUh0
TWNDYklkSGl2WG9CMkhnNE8vN3oyeTk4Cnl3Zm04ZytkUFRqMXJpeDBPeEtH
aWxjSHZsQTlwRGdiTFQ4RlhDUjZVWkRpd3dDQ0lpSUVIQ0tLS2Nobwo4aUFH
aG1JaWlCaEJISUtWQXlwR0pnU0NHVUVVd3hEVllDN3p3L2JtdGFPMHZuUEhp
WTAvLzJjM1BYZ0wKOElRS0JFTk9wdzBUQXFpa2xtM0x6cnZ4N1JkZisrYkJ5
alV6M1dOYkNIa3BsbXFrb3lFWGR4bE5Rb3RaCmFDa1UxZWhSMVNXdU5OcEtl
T1VoaWM4dGo2bEV5MUtkeC9nNFZ1aDZYanpUcDVuMXMvbTFvM1J1K3R5VAp5
Ny8vdTNjK2VvY0tHNmNUZ2pTL0dIRGxuc1UzZi82U3N6NTVRZjdpKzFsYm5n
MmlWb3pEWStKRVRDTkIKeUhqbEswR01ibGo5N2dwQm1COVBMcDVrTll6NC94
R3lXU25FU0NCV0NVTEc1MkJXL0ptZ2duUmF2Skp1CmYvRDNudWgrOWxPM2Z1
OEdFVTdhRkNHNHBpUXVQMi8rOGkrKzRjeGYyenM0ZnJXdHZweUpxWWx6eFhL
WgppSmlNVlZ1alNZek1vTHFibHVxdmtXaDFiQ29TcmI3SVdGT2tPaDcvUGxy
dDhjUnJ3aXBCeEtsSTZoQ24KQko5Yng5YVhMdGt4djMvcjlxWHVvY2RmL0w2
SzlKc3E0R3JDaHAzZnZQTE0vM0JCZnVKOXc5V1RtdUN3CjFJa1F4aXRjUFhR
MGVhMnZaT1VyUlJ1cnEvVUpOMWRkSWg4YnEzNGxoSnFtbGFzdUZNZVVNY2lF
WW15aQpLaUgzMXJLTnhmMkxDMmQzVzF1T0huNzIyT01HNFQvRzdyT2FTekQ0
OGxYbmZQZ2lXWDJ2NzY0bVdYQlkKb2lJbDJJMEhYUTdJWXZ1UGJMTmE5ZEhw
bFdlMnNSMUhTbElNUHBUblNmazlXaFdzOGtXUlpnQk9HN2dUCkNTa0F3VkNY
aW9YRTV2MkxGL3lyaStVWDlpNis1andkaTY1NGhGbmg2My8rMGgzdmZPK0Nm
WnoxN2lKRApDWmFvaUlVU1k3UnUxeUxncXRVdUJlSWttckNNQWEyMndnMzFy
NzZQN2hQZFA3NTNKZEJLS0txZ3JueEgKbXVLUzRqZHhoWElIUXhVSlE1L3N5
dklmKzlRVk96NW1zTTNKR0VyVktXYmcvdlcrM2UvdnJKKzYySGY3CjVzUVZT
Mnc2bnJ4UlBsREg5aDRCOW1oZ05RUXZCKzkwZkozR1psS3BzTmF4TVJaSUpk
d0owMktNRXk3QwppRXJnVm9JdmlscGl1cEczM3Jsci9uMXZPR2ZMbm1CdzNY
V0ZBSndCMTF4K3pvLy8wM24vQ2JkeVlza2gKNEVvaXBhNmdnU0tJMDdxZFZ2
Wk9OTEFZSENXeTZ4cVFhUU1BcVordk1aWTB3RTdqeVd2RGhjYlhhU1FNClFF
VkNDQ3kwQiswekZqYXZmZW5oNC9mZGZodnJWbzM2STlzM3YwblhUdXpMODc2
Wk9xbEpPdGlJSUl6ZQoxY0NyWXpYdllnM3ZLaEUrUk9ndVRmeUl3RTZqYTZY
QkI0UTZMNmdFR0p1blZLNno4am9PUll5TjN1eWwKaTNyMTYzYS85cXhLQ3hU
T2JmMUlaN2c5OVQxeFFVMGtqQjlpSTJwV3ZtMktuNDhtVjF0SmJYaUMwNmg1
CjgyME5EekVTaU1RckdtbWgxZ1ZhdzZta2VHNG96eDJtN01pNzIzN3A0STVk
Z1B6cXIyTDZ3UVBkeTFxOQo1UVAwaDJnWlFWUU1iVXc5bzhrMW1kcklEZXBZ
Q1VTbStIeXJyektSYVZTdllKSGd0T0V1R3FyZjFLWW0KbzNPUndGSEFZZVpJ
Tkp1L3NKTzhGVmhJRk5NRDdmWSs5Zmw1K0pLbzJQZ2hoWGFXT2hxbU1MVjRz
aFk5ClBWU21FdXBBS2JIcVJ2WWFNOG5ZbEdxcnl1UjNqVzFmNi9oa0Z0MURR
Uk1wU0dWN1pqWnB2UWxZREFhNgozYVhiMVB2TkVEQkZpcE1WUWlpbVh3M1VO
ZXhXbVBLOWNvTmg3TnRIL0Y4bjRjR2lTWXpPRFlBZkM4UEMKT0xZWXZUVUMx
cGgrNnhoem1yaGlnSE9HSnN3NFBYTjJkclp0Z0lvakE4c1FMVlM5RnBoRXFq
c0NKWjNVCkJBbWdWajQvV21GeFl4OXVvZUNkRW5PSzJKVmFoQXNSaGE1VTJX
d3ljaEZPbzVGUzl4SWxicWdvbU5CMgoyajV6TVZPQUpDUVZnd21sMjJ1a1dX
TFNLRk9DbHhGQ1cybkRBcTRrS2RaUTQwcTZHcm5VMEppRGN4SEYKTHBleW9x
cVZDdFZBczZGTm83SEdKaHNGK0RoVUVrMlNqc0l5Q1lsU3VMNllTRVNSWG1q
UTE4b2xqc0NzCm1yaEJva0JLQ0FPd0lVRUV6WWVGdG1aekpiR3ltRGVYZ3c0
Z0NZU2NNT3hoemlGT1VGK21aVndLaVlDUAp1WVNOSjE5RmhCWmpEZlc0d2NZ
dU9ZaktnSlJDQTVwdWJCUmtUQ0U1SXpXTWFHL0U4UzF4a0hmeForM2oKMUw1
MzRIYWNoUnRzNEI2OWg1a0gvZ3FSRERRdHJoc2h2aFc1RmQvRGI5dkZ5ZlBl
aU8zY2pYcElubjZjCnVjZnZRTmVYSVdsSFRCQUlwWGxhcEkxR1BiQ3FhWWdS
VkZGUmNsTVpEb3VmRXcyTXlRMU50eElGS0NHQwpjNVVHQ0Nwb0FzTXU0WjBm
Um43Nk04enVlQTFKR1c1YU44ZHUrQnh5NDY4WEFrQkJmWUVMbWtLK1FqajMK
UWdZZi94eHpldzZRcHFWWDNJREJZN2VTWGY4WjlOaERrRzBxeG1FTlhqQXlI
NjB2VXBTUmlpTm5uNHQwCmkvUWhTWnFrSmlJMlFsV2piamVWRkRWT1lzUmFY
TnI3WUlQZXdYZVJYZk03NUs3RDRNZ0REQjY3R1piTwpZZTdBdTdHUC9CS2gv
d3o2clM5Qk5sTmwxTUQzOFR1V2tHditCM2JlaGZpbmoyQkhEcFA0aytqK3E4
ajMKdnczOVNDRDc3TWZLTVNXbFoyQU0walhtTmlYRlU5SHhVamdxa0ZvcUFJ
bFZGOForczRheU5ESTNqY3hNCitkMGpKRC81QzBobkZyM3B5N2cvK1F6dDNo
UDBaMlpZZmMrL1orN3FhNUYzWEV1NDZ4QzZjUUswVTF5YgpuOEw5eU5YWTNn
dEovdjRJL3IvL1M3TGxaNUcxbDdEN2I4ZCs4WHBzMzV2aHJJdmhxWWVodFFo
aFdEN2IKSm9GUW9nVWlsRHBZaE1oYU1DVG1zeGFYTE16eS9QT2drRWMrWEJ0
SmgwYWdFU2RBTEtLdGFvUzBnM3ZOCmE1Q2hrZDc3RldZSGo2THRPZHJtNlJ5
Nkh2ZkMwOWhyZHhOMjdvUmhEOXdNbGlTWUtPeTZ1QURSTzc3Qgp6RlAzb21y
SXpDejY1SU5rUng5RTJ4bThkbGN4R0plTTNhVlJ6eXMyZzZ5bUIxS0hlYU1q
dVZ5eXlXbVYKRHpCVWJDSmdnVW0zV0V0U01sSS9DMGFhT0N6a21JSVAvV0tT
WVFpMFNOZFg4V3VyMEo0aExDeUJINEo2ClJJY0VseEMyN2tBUTNNcFRXRElE
K1FCTThiMlRxQTFMK0prcGhlN0h6RTlkZzVZM0JXRVRRWlVoYU1oeApscVdG
QUVLNXprMmVINGVnSTdhbVpYYW1lY3hCYjRYQkU0OFJuR0NYZnhDL1pVOEJp
cXRyK01GYW1VUU8KREZzcDFsK0gzakZzN1FUaVY1RmtGc2dKclI2aHR3eCtT
Sjh1NndkK0VuL2VHMkU0aE9OUEFDbDRYd3FpCkVRelZXS0hVWXdnZGg5bUtn
aVhTVjNXRkYzQVN3RUtCZnlVWEZJMWNYS3h1a2YrM0VFbFppaXJQYmIrUApY
dkZlV20vN2FUaGpIenoxUFlRdXRtTTcrdHBkRU5aby8raTdrTE1PUXBJVmx5
Y0cyN2RBT0lsNzYwK2gKTzg2SGJCUEp0bDFrRi80RWVXY0cvZVlmd3hNUFFh
dFRzRTZUQnEyMnNXYkdBVm5KL0FvU05hYnRobURlCkZ3SW9RajZtUkZRUjFi
UW1LSmFNcmFTOUlnSFNPVHFQSFdiakQvNEYvZ09mSXRtekg5MTNhVUVNdlVG
LwpCUnNNa1lQL0NIOHdHWTFmQWZHbllMaUJYUFFlOG92ZVh6d3VoMzV2Z0g3
dEQwbi85MjlnT2xNV1VHUzgKUUUyWHg1Unh4dVJOaWhTSVlpUkpTWVJja01n
RXBCbWxUS2V6TWQvV2NpcEJFQmFZdWVOcjVJL2NRdGg3CkJZT3pMa01YNXBp
WjZhRDczd3h6QzlqaHJ6Tjg5dThKbXBMUVJ6b2dsMThOclRQdzk5NU03L2hS
NlBhZword3J1NlNOa1R6MEFxVU53QmZreE45YkFaa0ZER29XV0puWkpVWnN3
R1I5TXhHRlM4Y3FKdExVMWtnME4KZHdpVXRhMVJ5Y3BsbTNEZElUeDRDQjY0
R1ZvSnROcHc5aC9EamlXNDl5Wm12bnNJWnRvUSt0QVdPUDh5Ck9HYzN5ZDFm
WWU3ZXZ3YWRoZDVxb1Fhejg2VWE2NWg5anN4Ukdva2FhWUJlNVNXb3hTOEJR
U1cxd2dSaQpobWZVczdEanl0TmtMaTlLbkl3VGthWE42Y3pJejVzWjlBenhE
dk50OHJ4RkppMmdEZG9tOUR3eU1FUlMKOGg2b0YzU21CWFFnNUJSNUNxdjcv
SW5NbEk2MW9DSnRGaStVMVhEQlZNalN2QkNBU0JDVE1nOFFwNzlqCjFqY3RH
VEVSbXBZNWc4SzNsTWVUWXF3RHhheUZ1YlJJc1BoZVVXazNoMWtLb1kyUUls
a2I4VkZFNTlKbwp4VXRTSTFGdHNNWldiUkxIb0tFRmhXMG9Sc3NYZHBBWUpt
aDU1UVJ4cURJcnNSbzEwbUZ4RHFBQ3BSQXcKelJFR2FGNGdXdCtLK2hKdEQr
dkxrQWdXT3JoV3dSMEF3bXdielhzd1hBVS9LQ2FldG9vNGd6SWFOQ245CnYw
M0dNRXpKSUkzb01wR3BHa203Qk1FSnhJOExGaFZXcXpMVlU2alZndzdBQnV1
d3RJVHR1eEkyTFVFdwpnaHJwd2h3U3V1UVhIY0RhaTRocWFlTUpzakFIK2N0
dzRBQ2VOVnk2QlhxbnNDZnVSNDQvaTVnV01VQ1YKUzJpYVJKV2hsbVpVcVBW
b2NWVFdGcHd2VFNCSVZJVVFKbGxWTEdHclNFV2NGeGcvd0V6cFhYU1Excy85
CkNucjJHd3NWVm5BQjhCNHZSdnFXajhLUHpkVEJlM0FTL0lEMDRGWGtCejlj
L09naHJLN1F2K2VydEwvNgoyK2l3SkZ4eGdYVDBPU1YvR01jS3RkcEJkV3lr
QVkwaUFqUUtsellaRUZtRE1LcURRWmR3N2h0b2ZmSnoKNk5KZStpOGVaL2pD
czRqMm1Na1V0L3NndVdRTUh6OUNlT1VaZkpvaWlXTm0weXpKMGw3STVoazg4
eVRyCkw5eUx0RHVFemlLZGJidVFxMzRXZitJRWV1aDNpMENvbGxDeDAxVDZk
ZEp0ai9Dd3VIYVlKR1U0RENMbApra290VFIxSFZhY1JUbFU3TkNFUGdudlhK
NUNsdmRnOWg5QS8rUyswVjE5QzhoZlFKR1B3NlZ1d004NmgKZGVQbnNRZS9q
U1VPc1Q2NmRRNnUvVDNZY3pucHQvNkkrVy9mQUxOYkNXRUZ1ZndEaEovNVQz
RFZSK0crClA0WFZIcmgyRVEvRWMxZXRkWGpVOFNwU0NUTUlnYUF3S0VHd3FC
ckV0VDRhcmkydUJkYVNDeFpGaFFHZApXMExPdmhpR0J2ZmNUUHJjUXpnR1Jk
N0RkNEErNmFDSGJKeENuZURTTnRwWmhGTTVyTHhjM0xPL2hzc2MKVGdLcFFI
TC9OM0V2UEF6YmQ4Q3VmWkQ3TVNqYmFmS0M2R1R6UlZ5c0tmT1hQdThWWnhk
dE5tV2F4ZVEwCm5UTlJGaWdPTkNyQmVFOEJhUm1XQytMOXlGN056Y0ttcllU
MlppeGZKNnlmS3ZtQ0Z1VEd0NkM3RGlMawpyUVdDaFlJOFpadXdZWXAyTjRv
aHBMTWxHVXFqa3J2VVUreTFmR1lqRVZ0cHRBcUlXU2Y0VUNpUGhjSXgKMWlR
MHBkUVZ1MFpwdUVjVjZCNWxlUHc1ZWpORzc0emQrUDRHcksvQVJoZlpzdy9k
dkIzV1RrQnZlU1EwCnZJUGhFRHY2QkFNVEJ2dXVvSi9Pd2JDSHJhOGltNWNZ
TEoxTDMrZXcvR3lkbDJpRDlkVklVYk5XV0MveApPUm15T0Z2eUFBaGw5WWV5
TStzZmFwNkxjRUhqa2xjQ29VZnJ6aSt3Y2NsYjZML3Q0NURQMEhuMlZsamEK
UTNibFB5ZWhoZDUzTzV3OER0cUM0QXVvVjVEN3Y0WjcwejltY05uVnBPc0dk
LzBGdmJsTnlCVWZJbXpkClRuYjNMZkQ4NDVBbFlNUFN2Vmw5WldXSzF0b1Vm
b0RoUk9sczdsU3hnSmdVdldGamR6TEtENGJKSW9oTgpxY2NaMEZwQzcvNXpP
bHZPeHQ3OTd3Z2Z2SWFzLzdQZ1VqWUdnZVNXRzJqZDlJZGpWbVlCd2dCY0Jp
ZGYKUXY3c1U3aWYrWFdHbDc4ZmQrbDd5SktFZmpEYTMva3IzRmMvQzNtQXBP
cGMxSW0rdmxya0tvMHluc1d1ClV4aGF3dDg5OTBvQVNISWpJRVhHckVhSVJ1
U21hVzlOTmhoNUpOdU0zUGlidEk3Y3lzYnJyMkoxNSt1Ugp3VExaSTM5RCtz
anRCYmVYWk13ZkZMQWNaQlo1OUI2U3ozNk00Zmx2WTNER21SZ1o3cG0vd3oz
MExjajcKNEdiS3pMU05ydzlXSjJ4TWFhQ3E4RDJNbXp6NnJaWjlkMldqTUlI
VUxDQVdDcFVPUmJocFZraGJ5cUtvCk5lc0RjWUZTNjV3N09aUGs2Qkhtano1
TVNPYkJQQzVzUUhzV3lNb21KcTMzR21CSXVvQmJXU0c5ODRhUwo2Z0s1eHpv
cG9zazRMVit0cExkNk5zZ2FhZjFtTjVrV1ZxY1lYZFFlOFhtaEFlcUgzdkxj
aXFOcFNXOEwKZnpsWmM0OXJlMXAzUVNKbHo5a1FTUlloZFRqTEM4WWxyU2lG
RlJjMG90U2FlVlJjVVVFU0xiUWxFU1EwCm1qSzByUGRYNlhCclZJSm91c1dH
WTNNQ1dlYnpZY2tEMWxzdVI5VWpocWhZUGNTMXladE9JMTRWN1J6NQo0UUEr
aDFCMjFPWldKRE9RU1EwaVRtNVlHUUlQQ3ZYT0F4UGhlb2pJanpDRnZrOHJq
R29wKzZKOGw3amMKYjhtN3hXaFhaN2V1eSt6Q3hxZ1ZGcXZYNld2NWoya1Yy
V1lYaU5SN0JrYlpXeDJ6V0tKMnRoSFBpTTRKClVVVkttL1YzcTZPOHlXUjhI
cmZPeGNVUk1Vd0M5THNEN1E0TEhuRHpVOFBIMWtpZklSVkNkVkh3VWU1dApT
bHZyUko5UFhOTFdjWk5FamFwS28vT2pRVmV0SVl4cUVxWUZMazNsWnpyWmh0
ZXNIbGUvaFlDSkNia24KRDRPWG4xdnVEZ0gwNjNmZWZkZnpyNXg2Z0hhVm9t
MnNxR21kYkJpVGlCc1BnaWtScGNVRmxTaWVhZm95CksvdTJxcjZDRWRXMnlY
WVphOXI5dElLSVJmZVZzZ3NuK0pkOCt2RHpnOEZxbFMzdnZxQ3p4OG9zcjlT
YQpGbXAyTFpNNXdianNIUHZia1VySHdxcUNrVVlpQXhvVnFKaTZLaE9nTVUz
YmFxcmZ4SmtTT0VSTVJCRnMKN1pHWE5tNEJYZ1lwTVAreDJTMnZoR3grWFVO
WGJOVFpFVW5lck42MEZJL1RySTY2SnBNSWFZMG01K2JxCnhBS3NnYXJWZzU5
cGhac21SV2xXdVVlRjBlS2V4MzE2Nmc4ZVBYa0VHUDdLcHo5ZExOT0p6TnNI
ZDI2NwpwRE5jUGN1Y003Rk1NRi9tNUNKN2M2N1JOZExzMUdwa2tFM3FHWnFh
QmtXVEU1bmUraktCUWJFWk1ObVgKS0kzcWtNakliVmd3a1RUemYzR1MyMzdy
TC8vMkJoVi84cFpiYmhWMUl0ejF0OC9kZDYvZjh0ZTBOMjlBCkh6UXJZbTdm
YUhBS1pVM2ZkSElROGVwWkZKZGJRK1VyTFduMklOZmlkc2Jlb0drcVZBblNo
bG1vVEhhYwpWczlWTVRSd0ttbS8vTldqcS84VCtrZDlNQUdDNWlHSXdQQy9Q
bkxpMXJYMjF1K3JEZ1NYQkxKTjVVMWMKMUM5czQwR0pUYW5ReW5UM1ZBTzB1
UEJhbGE2bVVPM0tESUxWTzBOSGRoMTd4akJPMlZYOUNsS1U2MGlVCkVJSklw
bmJIaWZWN3ZuVGI5eDVTa1ZEdHFsS1J3dXkvZWZoN3R6M013ditpcy9TaWhS
T0tlQ054RVppVgo2QnhuV1MzS0UxZ0VUdUpHelltRnRyZ0lzSFNzVVJhamV2
d1pnVnh0MDhXMFpza291SXBiZTZyZVMrL1IKUE5pYW4zL2dDNCt1L05aMTlK
LzJJWXhzUXhrblZBZWZ1T3Y0RjQ3Tjc3bGVzdXdrL25neFUrZWk5bmczCmZ2
Z29Qa2lLdExVMHQ4Sm81UDRpQVZhL1d5UXNqUVFtRGM1USs5NW9vYXM0aGt1
aTNrRkcvWVlobU9rdwp3TXoyWi83UGN1czN2M3ozQTdmOVdySDYwN2ZNdkhq
c1dPK2xiVHVQdm1QbmpuWnJjUEpjaHIxT1VHZmkKRWhtMW5NYnBNYTBHN2Vw
YlhsVEdHNk1tQUZLamtEdTZYNjBOWHliL245Q0NXRWpsL3k0WjhZWVF2S21a
CjBGbDg0YzlPeXZYLzVJdGYvN0tLbkFwbXRXeXFhMmErNzMvMDZlWGxjL1kv
L0tPNzl3N2F2bnVCREZmbQppNGg1eG9vZFpkWFd1S2lmVDZQbTZGaExuQnRQ
VkJ1Q2t3WnVPSzNuSVpteXVhTFpqdTljdlNOVUlYaHYKWWlCcEtubHI0ZnRm
T1M2Zi85QVh2L0ZIS2p3L2JlZllhYmZOOFliM2RRNWRObnZ0WmY2NWp5NzY1
UXNZCkRPYXdnTkVxTDFRelZhbVZ6aXJTVkZKZmFSWW9tLzNHTVg3b3REeEVw
UVUyZ3B6SmZVZ2dGaXo0Z0twQgptb3JQNW9kSCsrNnVQMzN5eEgvNzVXL2Nm
cU9JYkpqWnE5ODRHZkdjN0tmZTlQYTMvUExyT3UrNE1EbngKN25ueTgvQ0Rs
RnhhbUVoRVVhM0d6N1hSOWg3dk5MTnhicjYrNjZ6TVBiZ210NCtLb2RvTXlh
WFlkYWtwCkpDaytiZmRmR3FTSER6MXo0dFpQSGpyOGw2ZE9uVHFzSWdTekgy
N3ZjTGtIMTRDWnE2L1lmK1V2bnIvMAorbjFaZCtlbVRDOFZzL01SRmtRMUZY
R0NpSW9nb2xwdVJSRVVQKzQyRFhFUGNpTzFyVkZsZXVUbmRjd2cKWFZJbWFJ
bzlBR2FlNEJ4OWI1N0FTdGZrOFJXWnVlL3dzZjdSZjN2VDMzejcrZVBQMzFt
NnVIOXc4cTltCjh6Um1pRk5zekVrMkw3eHY3N2FMTHBwcjc1bHJzNWlwUzdN
a1UzV2lPQ20yTEltSXl4TFpOanVUbnJGcApQbVc0b1pZSGdwaG9vbUJCTk1t
S01sMEF4SWx6RWxTVllHSzU5NkllVk1Va1NIQ3VGWjQ4dVJxT3JRMU0KbkJo
NWJtdmVXM2RqMkQreHVyN3luZVBQUHY3Z3NaZS9DeXhYQzFlMisvL3dtNmVu
Q1FJTUZUSGpCM3BKClBabzY3U3MwNHNRZjZERXFnZy9oVlUrOGV2MWY0eGkv
ZXVwY290OEFBQUFBU1VWT1JLNUNZSUk9Cg==
";
import { ArrowUpRight, BookOpen, CalendarDays, Check, ChevronRight, Clock3, Command, Flame, Gauge, GraduationCap, LayoutDashboard, Menu, Pencil, Plus, LogOut, Settings, Sparkles, Target, Trash2, Trophy, TrendingUp, Upload, UserRound, X, Zap } from "lucide-react";

type Page = "dashboard" | "study" | "exams" | "scores" | "focus" | "journey" | "settings";
type Task = { id:number; title:string; subject:string; date:string; done:boolean; minutes:number };
type ExamLesson = { id:number; title:string; done:boolean };
type Exam = { id:number; name:string; subject:string; date:string; portion:string; progress:number; lessons:ExamLesson[]; revisionRounds:number; practiceTests:number; confidence:number; weakAreas:string };
type Score = { id:number; subject:string; test:string; obtained:number; max:number; date:string };
const today = (()=>{const d=new Date();const local=new Date(d.getTime()-d.getTimezoneOffset()*60000);return local.toISOString().slice(0,10)})();
const seedTasks:Task[]=[
 {id:1,title:"Quadratic equations practice",subject:"Maths",date:today,done:false,minutes:45},
 {id:2,title:"Revise electricity notes",subject:"Science",date:today,done:true,minutes:30},
 {id:3,title:"Read English chapter",subject:"English",date:today,done:false,minutes:25},
 {id:4,title:"SST map practice",subject:"SST",date:today,done:false,minutes:35}
];
const seedExams:Exam[]=[
 {id:1,name:"Maths Unit Test",subject:"Maths",date:"2026-10-02",portion:"Quadratic Equations, Arithmetic Progressions",progress:0,lessons:[{id:101,title:"Quadratic Equations",done:false},{id:102,title:"Arithmetic Progressions",done:false}],revisionRounds:0,practiceTests:0,confidence:0,weakAreas:""},
 {id:2,name:"Science Term Assessment",subject:"Science",date:"2026-10-09",portion:"Electricity, Magnetic Effects",progress:0,lessons:[{id:201,title:"Electricity",done:false},{id:202,title:"Magnetic Effects",done:false}],revisionRounds:0,practiceTests:0,confidence:0,weakAreas:""}
];
const seedScores:Score[]=[
 {id:1,subject:"Science",test:"Periodic Test",obtained:34,max:40,date:"2026-09-10"},
 {id:2,subject:"SST",test:"Periodic Test",obtained:37,max:40,date:"2026-09-10"},
 {id:3,subject:"English",test:"Periodic Test",obtained:37,max:40,date:"2026-09-10"}
];

type SavedData = { tasks:Task[]; exams:Exam[]; scores:Score[]; journey:string; classLevel:string; displayName:string; avatarUrl:string };
declare global { interface Window { __studentosData?: SavedData; __studentosEmail?: string; __studentosUserId?: string; __studentosUpdate?:()=>Promise<void> } }


function normalizeExam(exam:Partial<Exam>):Exam{
 const rawLessons=Array.isArray(exam.lessons)?exam.lessons:[];
 const lessons=rawLessons.length?rawLessons.map((l,i)=>({id:Number(l.id)||Date.now()+i,title:String(l.title||"Untitled lesson"),done:Boolean(l.done)})):String(exam.portion||"").split(",").map((title,i)=>({id:Date.now()+i,title:title.trim(),done:false})).filter(l=>l.title);
 const progress=lessons.length?Math.round(lessons.filter(l=>l.done).length/lessons.length*100):0;
 return {id:Number(exam.id)||Date.now(),name:String(exam.name||"New exam"),subject:String(exam.subject||"Other"),date:String(exam.date||today),portion:String(exam.portion||lessons.map(l=>l.title).join(", ")),progress,lessons,revisionRounds:Math.max(0,Number(exam.revisionRounds)||0),practiceTests:Math.max(0,Number(exam.practiceTests)||0),confidence:Math.min(5,Math.max(0,Number(exam.confidence)||0)),weakAreas:String(exam.weakAreas||"")};
}
function blankData():SavedData{
 return {tasks:seedTasks.map(x=>({...x})),exams:seedExams.map(x=>normalizeExam(x)),scores:seedScores.map(x=>({...x})),journey:"Make meaningful progress",classLevel:"",displayName:"Student",avatarUrl:""};
}

async function loadCloudData(userId:string):Promise<SavedData>{
 if(!supabase) return blankData();
 const {data,error}=await supabase.from("studentos_profiles").select("data").eq("id",userId).maybeSingle();
 if(error){console.error(error);return blankData();}
 if(!data?.data)return blankData();
 const merged={...blankData(),...(data.data as Partial<SavedData>)};
 return {...merged,exams:(merged.exams||[]).map(e=>normalizeExam(e))};
}

async function saveCloudData(userId:string,data:SavedData){
 if(!supabase) return;
 const {error}=await supabase.from("studentos_profiles").upsert({id:userId,data,updated_at:new Date().toISOString()});
 if(error) console.error(error);
}

function AvenroOSApp({mode,onExit,onSignIn,onDeleteAccount}:{mode:"anonymous"|"account";onExit:()=>Promise<void>|void;onSignIn:()=>void;onDeleteAccount:()=>Promise<string>}){
 const [page,setPage]=useState<Page>(()=>{const saved=sessionStorage.getItem("studentos-page");return saved&&["dashboard","study","exams","scores","focus","journey","settings"].includes(saved)?saved as Page:"dashboard"}),[sidebarCollapsed,setSidebarCollapsed]=useState(true),[selectedExamId,setSelectedExamId]=useState<number|null>(null);
 const initial=window.__studentosData||blankData();
 const [tasks,setTasks]=useState(initial.tasks),[exams,setExams]=useState(initial.exams),[scores,setScores]=useState(initial.scores);
 const [journey,setJourney]=useState(initial.journey),[classLevel,setClassLevel]=useState(initial.classLevel||""),[displayName,setDisplayName]=useState(initial.displayName||"Student"),[avatarUrl,setAvatarUrl]=useState(initial.avatarUrl||""),[showTask,setShowTask]=useState(false),[editingTask,setEditingTask]=useState<Task|null>(null),[showScore,setShowScore]=useState(false),[showExam,setShowExam]=useState(false);
 const [focusSeconds,setFocusSeconds]=useState(1500),[focusMinutes,setFocusMinutes]=useState(25),[focusRunning,setFocusRunning]=useState(false),[focusTaskTitle,setFocusTaskTitle]=useState(""),[accountError,setAccountError]=useState("");
 useEffect(()=>{
  if(mode!=="account"||!window.__studentosUserId)return;
  const payload={tasks,exams,scores,journey,classLevel,displayName,avatarUrl};
  const timer=window.setTimeout(()=>{void saveCloudData(window.__studentosUserId!,payload)},250);
  return()=>window.clearTimeout(timer);
 },[mode,tasks,exams,scores,journey,classLevel,displayName,avatarUrl]);
 useEffect(()=>{if(!focusRunning)return;const timer=window.setInterval(()=>setFocusSeconds(s=>{if(s<=1){setFocusRunning(false);return focusMinutes*60}return s-1}),1000);return()=>window.clearInterval(timer)},[focusRunning,focusMinutes]);
 useEffect(()=>{window.__studentosUpdate=async()=>{if(!("serviceWorker" in navigator))return false;const registration=await navigator.serviceWorker.getRegistration();if(!registration)return false;const previousWaiting=registration.waiting;await registration.update();const installing=registration.installing;if(installing){await new Promise<void>(resolve=>{const done=()=>{if(installing.state==="installed"||installing.state==="redundant"){installing.removeEventListener("statechange",done);resolve()}};installing.addEventListener("statechange",done);});}const waiting=registration.waiting;if(!waiting||waiting===previousWaiting)return false;sessionStorage.setItem("studentos-page",page);waiting.postMessage({type:"SKIP_WAITING"});await new Promise<void>(resolve=>{const timer=window.setTimeout(resolve,5000);navigator.serviceWorker.addEventListener("controllerchange",()=>{window.clearTimeout(timer);resolve()},{once:true})});window.location.reload();return true};return()=>{delete window.__studentosUpdate}},[page]);
 useEffect(()=>{sessionStorage.setItem("studentos-page",page)},[page]);
 const completed=tasks.filter(t=>t.done).length;
 const scoreAverage=scores.length?Math.round(scores.reduce((a,s)=>a+s.obtained/s.max,0)/scores.length*100):0;
 const navigate=(p:Page)=>{setPage(p);setMobileNav(false)}; const profileAction=()=>{navigate("settings")};
 const saveProfile=async(name:string,file?:File)=>{if(mode!=="account"||!supabase||!window.__studentosUserId)return "Sign in to update your profile.";const nextName=name.trim().slice(0,60);if(!nextName)return "Enter a display name.";let nextAvatar=avatarUrl;if(file){const allowed=["image/jpeg","image/png","image/webp","image/gif"];if(!allowed.includes(file.type))return "Choose a JPG, PNG, WebP, or GIF image.";if(file.size>5*1024*1024)return "Choose an image smaller than 5 MB.";const path=window.__studentosUserId+"/avatar";const bucket=supabase.storage.from("studentos-avatars");const {error:uploadError}=await bucket.upload(path,file,{upsert:true,contentType:file.type,cacheControl:"3600"});if(uploadError)return "Image upload failed: "+uploadError.message;const {data:urlData}=bucket.getPublicUrl(path);nextAvatar=urlData.publicUrl+"?v="+Date.now();}const {error:authError}=await supabase.auth.updateUser({data:{display_name:nextName,avatar_url:nextAvatar}});if(authError)return "Profile save failed: "+authError.message;setDisplayName(nextName);setAvatarUrl(nextAvatar);return "";};
 return <div className="app-shell">
  <button className={"sidebar-toggle "+(sidebarCollapsed?"is-closed":"is-open")} aria-label={sidebarCollapsed?"Open navigation":"Close navigation"} aria-expanded={!sidebarCollapsed} onClick={()=>setSidebarCollapsed(v=>!v)}>
   <span className="toggle-icon toggle-menu"><Menu size={21}/></span><span className="toggle-icon toggle-close"><X size={21}/></span>
  </button>
  <aside className={"sidebar "+(sidebarCollapsed?"collapsed":"")}>
   <div className="brand"><div className="brand-mark"><img src={AVENROOS_ICON} alt="" aria-hidden="true" /></div><div><strong>AvenroOS</strong><span>your school operating system</span></div></div>
   <nav>
    <NavItem icon={<LayoutDashboard size={18}/>} label="Dashboard" active={page==="dashboard"} onClick={()=>navigate("dashboard")}/>
    <NavItem icon={<BookOpen size={18}/>} label="Study" active={page==="study"} onClick={()=>navigate("study")}/>
    <NavItem icon={<CalendarDays size={18}/>} label="Exams" active={page==="exams"} onClick={()=>navigate("exams")}/>
    <NavItem icon={<TrendingUp size={18}/>} label="Scores" active={page==="scores"} onClick={()=>navigate("scores")}/>
    <NavItem icon={<Clock3 size={18}/>} label="Focus" active={page==="focus"} onClick={()=>navigate("focus")}/>
    <NavItem icon={<Target size={18}/>} label="Journey" active={page==="journey"} onClick={()=>navigate("journey")}/>
   </nav>
   <div className="sidebar-bottom"><div className="free-pill"><Zap size={15}/> Pricing</div><NavItem icon={<Settings size={18}/>} label="Settings" active={page==="settings"} onClick={()=>navigate("settings")}/></div>
  </aside>
  {!sidebarCollapsed&&<button className="mobile-sidebar-backdrop" aria-label="Close navigation" onClick={()=>setSidebarCollapsed(true)}/>}
  <main className="main">
   <header className="topbar"><div><div className="eyebrow">AVENROOS</div><h1>{pageTitle(page)}</h1></div><div className="top-actions"><div className="mode-badge"><span className="dot"/>{mode==="account"?"Saved account":"Anonymous session"}</div>{mode==="account"&&<button className="ghost-btn top-logout" onClick={()=>void onExit()} title="Log out"><LogOut size={15}/> Log out</button>}<button className="avatar" onClick={profileAction} title="Open profile settings">{avatarUrl?<img src={avatarUrl} alt="Profile"/>:displayName.slice(0,1).toUpperCase()||"S"}</button></div></header>
   <div className="content">
    {page==="dashboard"&&<Dashboard journey={journey} classLevel={classLevel} completed={completed} tasks={tasks} exams={exams} scoreAverage={scoreAverage} navigate={navigate} setTasks={setTasks} onAddTask={()=>setShowTask(true)} onEditTask={setEditingTask} onDeleteTask={id=>setTasks(all=>all.filter(x=>x.id!==id))}/>} 
    {page==="study"&&<Study tasks={tasks} setTasks={setTasks} onAdd={()=>setShowTask(true)} onEditTask={setEditingTask} onDeleteTask={id=>setTasks(all=>all.filter(x=>x.id!==id))} onFocus={task=>{setFocusTaskTitle(task.title);setFocusMinutes(task.minutes);setFocusSeconds(task.minutes*60);setFocusRunning(false);setPage("focus")}}/>}
    {page==="exams"&&<Exams exams={exams} setExams={setExams} onAdd={()=>setShowExam(true)} selectedExamId={selectedExamId} setSelectedExamId={setSelectedExamId}/>}
    {page==="scores"&&<Scores scores={scores} setScores={setScores} onAdd={()=>setShowScore(true)}/>}
    {page==="focus"&&<Focus seconds={focusSeconds} minutes={focusMinutes} setMinutes={setFocusMinutes} running={focusRunning} setRunning={setFocusRunning} taskTitle={focusTaskTitle} reset={(minutes)=>{setFocusRunning(false);setFocusSeconds((minutes??focusMinutes)*60)}}/>}
    {page==="journey"&&<Journey journey={journey} setJourney={setJourney} completed={completed} exams={exams} scoreAverage={scoreAverage}/>}
    {page==="settings"&&<SettingsPage journey={journey} setJourney={setJourney} classLevel={classLevel} setClassLevel={setClassLevel} mode={mode} displayName={displayName} avatarUrl={avatarUrl} onProfileSave={saveProfile} onLogout={onExit} onDeleteAccount={onDeleteAccount} onSignIn={()=>{if(!supabase){setAccountError("Supabase is not connected yet. Sign up & sync will be available after the AvenroOS Supabase environment is configured.");return;}setAccountError("");onSignIn()}} accountError={accountError}/>}
   </div>
  </main>
  {showTask&&<TaskModal close={()=>{setShowTask(false);setEditingTask(null)}} add={t=>{setTasks(x=>[...x,t]);setShowTask(false)}}/>}
  {editingTask&&<TaskModal task={editingTask} close={()=>setEditingTask(null)} save={updated=>{setTasks(all=>all.map(x=>x.id===updated.id?updated:x));setEditingTask(null)}}/>}
  {showScore&&<ScoreModal close={()=>setShowScore(false)} add={s=>{setScores(x=>[...x,s]);setShowScore(false)}}/>}
  {showExam&&<ExamModal close={()=>setShowExam(false)} add={e=>{setExams(x=>[...x,e]);setShowExam(false)}}/>}
 </div>
}

function FeatureCard(p:{number:string;icon:ReactNode;title:string;text:string}){return <article className="feature-card"><div className="feature-top"><span>{p.number}</span><div className="feature-icon">{p.icon}</div></div><h4>{p.title}</h4><p>{p.text}</p><div className="feature-line"/></article>}
function NavItem(p:{icon:ReactNode;label:string;active:boolean;onClick:()=>void}){return <button className={p.active?"nav-item active":"nav-item"} onClick={p.onClick}>{p.icon}<span>{p.label}</span>{p.active&&<ChevronRight size={15}/>}</button>}
function Dashboard(p:{journey:string;classLevel:string;completed:number;tasks:Task[];exams:Exam[];scoreAverage:number;navigate:(x:Page)=>void;setTasks:Dispatch<SetStateAction<Task[]>>;onAddTask:()=>void;onEditTask:(task:Task)=>void;onDeleteTask:(id:number)=>void}){
 const todayTasks=p.tasks.filter(t=>t.date===today);
 const nextTask=todayTasks.find(t=>!t.done)||p.tasks.find(t=>!t.done);
 const nextExam=[...p.exams].filter(e=>e.date>=today).sort((a,b)=>a.date.localeCompare(b.date))[0];
 return <div className="stack dashboard-stack">
  <section className="hero-card"><div><div className="hero-kicker"><Sparkles size={15}/> YOUR PERSONAL OPERATING SYSTEM FOR SCHOOL</div><h2>Here’s what matters today.</h2><p>One clear next move first. Your exams, scores, and bigger goal come after.</p>{nextTask?<button className="primary-btn" onClick={()=>p.navigate("study")}>Work on “{nextTask.title}” <ChevronRight size={17}/></button>:<button className="primary-btn" onClick={p.onAddTask}><Plus size={17}/> Add your next task</button>}</div><div className="hero-orbit"><div><GraduationCap size={34}/><strong>{p.classLevel||"—"}</strong><span>{p.classLevel?"Class / Grade":"Set your class"}</span></div></div></section>
  <section className="priority-card"><div className="priority-copy"><span className="eyebrow">YOUR NEXT MOVE</span><h3>{nextTask?nextTask.title:"Nothing urgent is queued."}</h3><p>{nextTask?nextTask.subject+" · "+nextTask.minutes+" min":nextExam?"Your next exam is "+nextExam.name+". Add a study session to start preparing.":"Add a study session and AvenroOS will put it here."}</p></div><div className="priority-actions">{nextTask?<><button className="primary-btn" onClick={()=>p.navigate("study")}>Open task <ChevronRight size={16}/></button><button className="ghost-btn" onClick={()=>p.setTasks(all=>all.map(x=>x.id===nextTask.id?{...x,done:true}:x))}>Mark done</button></>:<button className="primary-btn" onClick={p.onAddTask}><Plus size={16}/> Add task</button>}</div></section>
  <div className="section-heading"><div><h3>Today</h3><p>Start here. Everything else can wait.</p></div><button className="ghost-btn" onClick={p.onAddTask}><Plus size={16}/> Add task</button></div>
  <div className="two-col dashboard-primary-grid">
   <section className="panel"><div className="panel-head"><div><h3>Today's study plan</h3><p>{todayTasks.length} sessions scheduled</p></div><button className="text-btn" onClick={()=>p.navigate("study")}>View all</button></div><div className="task-list">{todayTasks.map(t=><TaskRow key={t.id} task={t} toggle={()=>p.setTasks(all=>all.map(x=>x.id===t.id?{...x,done:!x.done}:x))} onEdit={()=>p.onEditTask(t)} onDelete={()=>p.onDeleteTask(t.id)}/>)}</div></section>
   <section className="panel"><div className="panel-head"><div><h3>Upcoming exams</h3><p>{nextExam?"Your next academic deadline is here.":"Add an exam to keep it on your radar."}</p></div><button className="text-btn" onClick={()=>p.navigate("exams")}>View all</button></div>{p.exams.map(e=><div className="exam-mini" key={e.id}><div className="date-box"><strong>{new Date(e.date+"T12:00:00").getDate()}</strong><span>{new Date(e.date+"T12:00:00").toLocaleString("en",{month:"short"})}</span></div><div className="grow"><strong>{e.name}</strong><span>{e.subject+" · "+e.progress+"% prepared"}</span><div className="progress"><i style={{width:e.progress+"%"}}/></div></div></div>)}</section>
  </div>
  <section className="stats-grid dashboard-secondary-stats"><Stat icon={<Check/>} label="Study tasks" value={p.completed+"/"+p.tasks.length+" complete"}/><Stat icon={<TrendingUp/>} label="Score average" value={p.scoreAverage+"%"}/><Stat icon={<CalendarDays/>} label="Upcoming exams" value={String(p.exams.length)}/></section>
  <section className="mission-strip"><div className="mission-icon"><Flame size={22}/></div><div><span>YOUR WHY</span><strong>{p.journey}</strong></div><button onClick={()=>p.navigate("journey")}>Open journey <ChevronRight size={16}/></button></section>
 </div>
}
function Study(p:{tasks:Task[];setTasks:Dispatch<SetStateAction<Task[]>>;onAdd:()=>void;onEditTask:(task:Task)=>void;onDeleteTask:(id:number)=>void;onFocus:(task:Task)=>void}){const [filter,setFilter]=useState("All");const subjects=["All",...Array.from(new Set(p.tasks.map(t=>t.subject)))];const shown=filter==="All"?p.tasks:p.tasks.filter(t=>t.subject===filter);return <div className="stack"><PageIntro title="Study command center" text="Turn your syllabus into small, finishable sessions." action={<button className="primary-btn" onClick={p.onAdd}><Plus size={17}/> Add study session</button>}/><div className="filter-row">{subjects.map(s=><button key={s} className={filter===s?"filter active":"filter"} onClick={()=>setFilter(s)}>{s}</button>)}</div><section className="panel"><div className="panel-head"><div><h3>Study sessions</h3><p>Tap a session when it is done.</p></div><span className="count-pill">{shown.filter(t=>t.done).length+"/"+shown.length}</span></div><div className="task-list large">{shown.map(t=><TaskRow key={t.id} task={t} toggle={()=>p.setTasks(all=>all.map(x=>x.id===t.id?{...x,done:!x.done}:x))} onEdit={()=>p.onEditTask(t)} onDelete={()=>p.onDeleteTask(t.id)} onFocus={()=>p.onFocus(t)} detailed/>)}</div></section></div>}
function Exams(p:{exams:Exam[];setExams:Dispatch<SetStateAction<Exam[]>>;onAdd:()=>void;selectedExamId:number|null;setSelectedExamId:(id:number|null)=>void}){
 return <div className="stack"><PageIntro title="Exam control" text="Know what's coming and how ready you actually are." action={<button className="primary-btn" onClick={p.onAdd}><Plus size={17}/> Add exam</button>}/>
  <div className="exam-grid">{p.exams.map(e=><section className="panel exam-card exam-card-clickable" key={e.id} onClick={()=>p.setSelectedExamId(e.id)}>
   <div className="exam-card-top"><div className="date-box"><strong>{new Date(e.date+"T12:00:00").getDate()}</strong><span>{new Date(e.date+"T12:00:00").toLocaleString("en",{month:"short"})}</span></div><button className="icon-btn" aria-label={"Delete "+e.name} onClick={event=>{event.stopPropagation();p.setExams(all=>all.filter(x=>x.id!==e.id));if(p.selectedExamId===e.id)p.setSelectedExamId(null)}}><X size={16}/></button></div>
   <span className="tag">{e.subject}</span><h3>{e.name}</h3><p>{e.portion||"No lessons added yet."}</p>
   <div className="progress-label"><span>Preparation</span><strong>{e.progress+"%"}</strong></div><div className="progress"><i style={{width:e.progress+"%"}}/></div>
   <div className="exam-meta"><span>{e.lessons.filter(l=>l.done).length}/{e.lessons.length} lessons studied</span><span>{e.revisionRounds} revisions · {e.practiceTests} practice tests</span></div>
  </section>)}</div>
  {p.selectedExamId!==null&&p.exams.some(e=>e.id===p.selectedExamId)&&<ExamDetail key={p.selectedExamId} exam={p.exams.find(e=>e.id===p.selectedExamId)!} setExams={p.setExams} close={()=>p.setSelectedExamId(null)}/>}
 </div>
}
function ExamDetail(p:{exam:Exam;setExams:Dispatch<SetStateAction<Exam[]>>;close:()=>void}){
 const e=p.exam,studied=e.lessons.filter(l=>l.done).length,progress=e.lessons.length?Math.round(studied/e.lessons.length*100):0;
 const [newLesson,setNewLesson]=useState(""),[weakAreas,setWeakAreas]=useState(e.weakAreas),[revision,setRevision]=useState(String(e.revisionRounds)),[practice,setPractice]=useState(String(e.practiceTests)),[confidence,setConfidence]=useState(String(e.confidence));
 const update=(patch:Partial<Exam>)=>p.setExams(all=>all.map(x=>x.id===e.id?normalizeExam({...e,...patch}):x));
 const toggleLesson=(id:number)=>{const lessons=e.lessons.map(l=>l.id===id?{...l,done:!l.done}:l);p.setExams(all=>all.map(x=>x.id===e.id?normalizeExam({...e,lessons}):x));};
 const addLesson=()=>{const title=newLesson.trim();if(!title)return;const lessons=[...e.lessons,{id:Date.now(),title,done:false}];p.setExams(all=>all.map(x=>x.id===e.id?normalizeExam({...e,lessons,portion:lessons.map(l=>l.title).join(", ")}):x));setNewLesson("");};
 const removeLesson=(id:number)=>{const lessons=e.lessons.filter(l=>l.id!==id);p.setExams(all=>all.map(x=>x.id===e.id?normalizeExam({...e,lessons,portion:lessons.map(l=>l.title).join(", ")}):x));};
 return <div className="panel exam-detail"><div className="exam-detail-head"><div><span className="eyebrow">EXAM PROGRESS</span><h3>{e.name} · {e.subject}</h3><p>{e.date}</p></div><button className="icon-btn" onClick={p.close} aria-label="Close exam progress"><X size={17}/></button></div>
  <div className="exam-progress-hero"><div><span>Progress</span><strong>{progress}%</strong></div><div className="progress"><i style={{width:progress+"%"}}/></div></div>
  <div className="exam-kpis"><div><span>Lessons studied</span><strong>{studied}</strong><small>of {e.lessons.length}</small></div><div><span>Lessons left</span><strong>{Math.max(0,e.lessons.length-studied)}</strong><small>to complete</small></div><div><span>Revisions</span><strong>{e.revisionRounds}</strong><small>rounds</small></div><div><span>Practice tests</span><strong>{e.practiceTests}</strong><small>completed</small></div></div>
  <div className="exam-detail-grid">
   <section><div className="panel-head"><div><h4>Lessons</h4><p>Progress is calculated from completed lessons.</p></div></div><div className="lesson-list">{e.lessons.map(l=><div className={l.done?"lesson-row done":"lesson-row"} key={l.id}><button className="check-btn" onClick={()=>toggleLesson(l.id)} aria-label={l.done?"Mark lesson incomplete":"Mark lesson complete"}>{l.done?<Check size={14}/>:null}</button><span>{l.title}</span><button className="icon-btn" onClick={()=>removeLesson(l.id)} aria-label={"Remove "+l.title}><Trash2 size={14}/></button></div>)}</div>
    <div className="add-lesson"><input value={newLesson} onChange={event=>setNewLesson(event.target.value)} placeholder="Add new lesson"/><button className="primary-btn small" onClick={addLesson}><Plus size={15}/> Add</button></div></section>
   <section className="exam-side-controls"><label className="field"><span>Revision rounds</span><input type="number" min="0" value={revision} onChange={event=>{setRevision(event.target.value);update({revisionRounds:Math.max(0,Number(event.target.value)||0)})}}/></label><label className="field"><span>Practice tests completed</span><input type="number" min="0" value={practice} onChange={event=>{setPractice(event.target.value);update({practiceTests:Math.max(0,Number(event.target.value)||0)})}}/></label><label className="field"><span>Confidence (0–5)</span><input type="number" min="0" max="5" value={confidence} onChange={event=>{setConfidence(event.target.value);update({confidence:Math.min(5,Math.max(0,Number(event.target.value)||0))})}}/></label><label className="field"><span>Weak areas / notes</span><textarea value={weakAreas} onChange={event=>{setWeakAreas(event.target.value);update({weakAreas:event.target.value})}} placeholder="Topics to revisit..."/></label></section>
  </div>
 </div>
}

function UpdateControl(){
 const [status,setStatus]=useState<"idle"|"checking"|"updated"|"latest"|"error">("idle");
 const check=async()=>{setStatus("checking");try{const changed=await window.__studentosUpdate?.();setStatus(changed?"updated":"latest")}catch{setStatus("error")}};
 const text=status==="checking"?"Checking the latest AvenroOS deployment…":status==="updated"?"New version installed. Your current section will be restored.":status==="latest"?"You're up to date.":"Check whether a newer AvenroOS deployment is available.";
 return <SettingBlock title="App updates" text={text} right={<button className="ghost-btn" disabled={status==="checking"} onClick={()=>void check()}>{status==="checking"?"Checking…":"Check for updates"}</button>}/>;
}
function Scores(p:{scores:Score[];setScores:Dispatch<SetStateAction<Score[]>>;onAdd:()=>void}){const total=p.scores.reduce((a,s)=>a+s.obtained,0),max=p.scores.reduce((a,s)=>a+s.max,0);return <div className="stack"><PageIntro title="Score tracker" text="Record marks and watch your progress build over time." action={<button className="primary-btn" onClick={p.onAdd}><Plus size={17}/> Add score</button>}/><div className="stats-grid"><Stat icon={<Gauge/>} label="Overall recorded" value={(max?Math.round(total/max*100):0)+"%"}/><Stat icon={<Trophy/>} label="Tests recorded" value={String(p.scores.length)}/></div><section className="panel"><div className="panel-head"><div><h3>Recent scores</h3><p>Your recorded assessments.</p></div></div><div className="score-table"><div className="score-row head"><span>Subject</span><span>Assessment</span><span>Marks</span><span>Percent</span><span/></div>{p.scores.map(s=><div className="score-row" key={s.id}><strong>{s.subject}</strong><span>{s.test}</span><span>{s.obtained+"/"+s.max}</span><strong>{Math.round(s.obtained/s.max*100)+"%"}</strong><button className="icon-btn" onClick={()=>p.setScores(all=>all.filter(x=>x.id!==s.id))}><X size={15}/></button></div>)}</div></section></div>}
function Focus(p:{seconds:number;minutes:number;setMinutes:(x:number)=>void;running:boolean;setRunning:(x:boolean)=>void;taskTitle?:string;reset:(minutes?:number)=>void}){const m=Math.floor(p.seconds/60).toString().padStart(2,"0"),s=(p.seconds%60).toString().padStart(2,"0");const [draft,setDraft]=useState(String(p.minutes));useEffect(()=>{if(!p.running)setDraft(String(p.minutes))},[p.minutes,p.running]);const applyDuration=(value:string)=>{setDraft(value);if(value==="")return;const numeric=Number(value);if(!Number.isFinite(numeric))return;const next=Math.min(180,Math.max(1,Math.floor(numeric)));p.setMinutes(next);if(!p.running)p.reset(next)};const commitDuration=()=>{const numeric=Number(draft);const next=Number.isFinite(numeric)&&numeric>0?Math.min(180,Math.max(1,Math.floor(numeric))):1;setDraft(String(next));p.setMinutes(next);if(!p.running)p.reset(next)};const step=(delta:number)=>{const current=Number(draft)||p.minutes;const next=Math.min(180,Math.max(1,current+delta));setDraft(String(next));p.setMinutes(next);if(!p.running)p.reset(next)};return <div className="focus-page"><div className="focus-card"><div className="hero-kicker"><Clock3 size={15}/> FOCUS MODE</div><h2>{m+":"+s}</h2><p>{p.taskTitle?<>Working on <strong>{p.taskTitle}</strong>. Stay with it until the block ends.</>: "One focused block. One clear objective."}</p><div className="focus-actions"><button className="primary-btn" onClick={()=>p.setRunning(!p.running)}>{p.running?"Pause":"Start focus"}</button><button className="ghost-btn" onClick={()=>p.reset()}>Reset</button></div><div className="focus-duration"><label htmlFor="focus-minutes">Session length</label><div className="duration-control"><button type="button" className="duration-step" aria-label="Decrease session length by 1 minute" disabled={p.running||p.minutes<=1} onClick={()=>step(-1)}>−</button><input id="focus-minutes" type="text" inputMode="numeric" pattern="[0-9]*" value={draft} disabled={p.running} onChange={e=>applyDuration(e.target.value.replace(/\D/g,"").slice(0,3))} onBlur={commitDuration} onKeyDown={e=>{if(e.key==="Enter")e.currentTarget.blur()}} aria-describedby="focus-duration-help"/><button type="button" className="duration-step" aria-label="Increase session length by 1 minute" disabled={p.running||p.minutes>=180} onClick={()=>step(1)}>+</button><span>minutes</span></div><div className="duration-presets">{[15,25,45,60,90].map(v=><button key={v} type="button" className={p.minutes===v?"duration-preset active":"duration-preset"} disabled={p.running} onClick={()=>{setDraft(String(v));p.setMinutes(v);p.reset(v)}}>{v}m</button>)}</div></div><div className="focus-note" id="focus-duration-help"><Zap size={17}/> Choose any focus length from 1–180 minutes.</div></div></div>}function Journey(p:{journey:string;setJourney:(s:string)=>void;completed:number;exams:Exam[];scoreAverage:number}){const [editing,setEditing]=useState(false),[draft,setDraft]=useState(p.journey);return <div className="stack"><PageIntro title="Your journey" text="Give the next phase of school a name that means something to you."/><section className="journey-card"><div className="journey-badge"><Target size={27}/></div><div className="grow"><span className="eyebrow">CURRENT JOURNEY</span>{editing?<div className="inline-edit"><input value={draft} onChange={e=>setDraft(e.target.value)}/><button className="primary-btn small" onClick={()=>{p.setJourney(draft);setEditing(false)}}>Save</button></div>:<h2>{p.journey}</h2>}<p>Keep this objective visible when deciding what deserves your attention.</p></div>{!editing&&<button className="ghost-btn" onClick={()=>setEditing(true)}>Edit</button>}</section><div className="journey-grid"><Stat icon={<Check/>} label="Study sessions done" value={String(p.completed)}/><Stat icon={<TrendingUp/>} label="Recorded score level" value={p.scoreAverage+"%"}/><Stat icon={<CalendarDays/>} label="Exams on radar" value={String(p.exams.length)}/></div></div>}
function SettingsPage(p:{journey:string;setJourney:(s:string)=>void;classLevel:string;setClassLevel:(s:string)=>void;mode:"anonymous"|"account";onSignIn:()=>void;accountError:string;displayName:string;avatarUrl:string;onProfileSave:(name:string,file?:File)=>Promise<string>;onLogout:()=>Promise<void>|void;onDeleteAccount:()=>Promise<string>}) {
 const [objective,setObjective]=useState(p.journey),[grade,setGrade]=useState(p.classLevel),[name,setName]=useState(p.displayName),[profileMessage,setProfileMessage]=useState(""),[savingProfile,setSavingProfile]=useState(false),[deleting,setDeleting]=useState(false);
 const fileInput=useRef<HTMLInputElement>(null);
 const [selectedImageUrl,setSelectedImageUrl]=useState("");
 useEffect(()=>()=>{if(selectedImageUrl)URL.revokeObjectURL(selectedImageUrl)},[selectedImageUrl]);
 const chooseImage=(file?:File)=>{if(!file){setSelectedImageUrl("");return;}if(selectedImageUrl)URL.revokeObjectURL(selectedImageUrl);setSelectedImageUrl(URL.createObjectURL(file));};
 const saveProfile=async()=>{setSavingProfile(true);const message=await p.onProfileSave(name,fileInput.current?.files?.[0]);setProfileMessage(message||"Profile saved.");setSavingProfile(false);if(!message&&fileInput.current){fileInput.current.value="";setSelectedImageUrl("");}};
 const deleteAccount=async()=>{if(!window.confirm("Permanently delete your AvenroOS account and all saved data? This cannot be undone."))return;setDeleting(true);const message=await p.onDeleteAccount();setDeleting(false);setProfileMessage(message);};
 return <div className="stack"><PageIntro title="Settings" text="Make AvenroOS yours. Your profile choices shape what you see."/>
 <section className="panel settings-panel">
  {p.mode==="account"&&<SettingBlock title="Your profile" text="Update your name or choose a new profile image. Images are saved under your account." right={<button className="ghost-btn" disabled={savingProfile} onClick={saveProfile}>{savingProfile?"Saving…":"Save profile"}</button>}>
   <div className="profile-editor"><button className="profile-image-button" type="button" aria-label="Choose profile image" onClick={()=>fileInput.current?.click()}>{selectedImageUrl||p.avatarUrl?<img src={selectedImageUrl||p.avatarUrl} alt="Profile preview"/>:<UserRound size={28}/>}<span className="profile-edit-badge" aria-hidden="true"><Pencil size={13}/></span></button><input ref={fileInput} className="visually-hidden" id="profile-image-input" type="file" accept="image/png,image/jpeg,image/webp,image/gif" aria-label="Choose profile image" onChange={e=>chooseImage(e.target.files?.[0])}/><label>Display name<input className="setting-input" value={name} maxLength={60} onChange={e=>setName(e.target.value)} placeholder="Your name"/></label></div>{profileMessage&&<div className={profileMessage==="Profile saved."?"auth-success":"auth-error settings-auth-error"}>{profileMessage}</div>}
  </SettingBlock>}
  <SettingBlock title="Profile & preferences" text="Choose the class or grade you want AvenroOS to display. You can change this anytime." right={<span className="status-pill"><span className="dot"/> Personalised</span>}>
   <div className="preference-row"><label>Class / grade<select className="setting-input" value={grade} onChange={e=>{setGrade(e.target.value);p.setClassLevel(e.target.value)}}><option value="">Not set</option>{Array.from({length:12},(_,i)=><option key={i+1} value={String(i+1)}>Class {i+1}</option>)}<option value="College">College</option></select></label></div>
  </SettingBlock>
  <SettingBlock title="Session mode" text={p.mode==="account"?"Your AvenroOS workspace is connected to your account and syncs your changes.":"Anonymous mode keeps this session in memory only. Sign up anytime to keep your workspace across sessions."} right={<span className="status-pill"><span className="dot"/> {p.mode==="account"?"Account synced":"Anonymous"}</span>}/>
  <SettingBlock title="Journey objective" text="This is the main objective shown around AvenroOS." right={<button className="ghost-btn" onClick={()=>p.setJourney(objective)}>Save</button>}><input className="setting-input" value={objective} onChange={e=>setObjective(e.target.value)}/></SettingBlock>
  <SettingBlock title="Account & sync" text={p.mode==="account"?"Your account is connected. AvenroOS saves your workspace to the cloud as you make changes.":"Create or sign in to an account to keep your AvenroOS workspace synced across sessions."} right={p.mode==="account"?<button className="ghost-btn" onClick={()=>void p.onLogout()}><LogOut size={15}/> Log out</button>:<button className="primary-btn setting-signin" onClick={p.onSignIn}>Sign up & sync <ChevronRight size={15}/></button>}>
   {p.accountError&&<div className="auth-error settings-auth-error">{p.accountError}</div>}
  </SettingBlock>
  <UpdateControl />
  {p.mode==="account"&&<SettingBlock title="Delete account" text="Permanently remove your account, synced workspace, and profile image. This cannot be undone." right={<button className="danger-btn" disabled={deleting} onClick={deleteAccount}>{deleting?"Deleting…":"Delete account"}</button>}/>}
  <SettingBlock title="Data" text={p.mode==="account"?"Your tasks, exams, scores, journey and profile preferences are stored in your account database.":"Anonymous data stays in memory and is not uploaded to a cloud account."} right={<span className="muted">{p.mode==="account"?"Cloud saved":"Local only"}</span>}/>
 </section></div>
}
function SettingBlock(p:{title:string;text:string;right:ReactNode;children?:ReactNode}){return <div className="setting-block"><div className="grow"><h3>{p.title}</h3><p>{p.text}</p>{p.children}</div><div>{p.right}</div></div>}
function Stat(p:{icon:ReactNode;label:string;value:string}){return <div className="stat-card"><div className="stat-icon">{p.icon}</div><div><span>{p.label}</span><strong>{p.value}</strong></div></div>}
function TaskRow(p:{task:Task;toggle:()=>void;onEdit:()=>void;onDelete:()=>void;onFocus?:()=>void;detailed?:boolean}){return <div className={p.task.done?"task-row done":"task-row"}><button className="check-btn" onClick={p.toggle} aria-label={p.task.done?"Mark incomplete":"Mark complete"}>{p.task.done?<Check size={15}/>:null}</button><div className="grow"><strong>{p.task.title}</strong><span>{p.task.subject+(p.detailed?" · "+p.task.date:"")}</span></div><span className="minutes">{p.task.minutes+"m"}</span><div className="task-actions">{p.onFocus&&<button className="task-action" onClick={p.onFocus} aria-label={"Focus on "+p.task.title} title="Start focus"><Zap size={14}/></button>}<button className="task-action" onClick={p.onEdit} aria-label={"Edit "+p.task.title} title="Edit"><Pencil size={14}/></button><button className="task-action danger" onClick={p.onDelete} aria-label={"Delete "+p.task.title} title="Delete"><Trash2 size={14}/></button></div></div>}
function PageIntro(p:{title:string;text:string;action?:ReactNode}){return <div className="page-intro"><div><h2>{p.title}</h2><p>{p.text}</p></div>{p.action}</div>}
function Modal(p:{title:string;close:()=>void;children:ReactNode}){return <div className="modal-backdrop" onMouseDown={p.close}><div className="modal" onMouseDown={e=>e.stopPropagation()}><div className="modal-head"><h3>{p.title}</h3><button className="icon-btn" onClick={p.close}><X/></button></div>{p.children}</div></div>}
function ModalActions(p:{close:()=>void;save:()=>void}){return <div className="modal-actions"><button className="ghost-btn" onClick={p.close}>Cancel</button><button className="primary-btn" onClick={p.save}>Save</button></div>}
function FormInput(p:{label:string;value:string;onChange:(s:string)=>void;placeholder?:string;type?:string}){return <label className="field"><span>{p.label}</span><input type={p.type||"text"} value={p.value} onChange={e=>p.onChange(e.target.value)} placeholder={p.placeholder}/></label>}
function TaskModal(p:{close:()=>void;add?:(t:Task)=>void;task?:Task;save?:(t:Task)=>void}){const editing=!!p.task;const [title,setTitle]=useState(p.task?.title||"");const [subject,setSubject]=useState(p.task?.subject||"Maths");const [minutes,setMinutes]=useState(String(p.task?.minutes||30));const [date,setDate]=useState(p.task?.date||today);const submit=()=>{const task:Task={id:p.task?.id||Date.now(),title:title.trim()||"Untitled study session",subject:subject.trim()||"Other",date,done:p.task?.done||false,minutes:Math.max(1,Number(minutes)||30)};if(editing)p.save?.(task);else p.add?.(task)};return <Modal title={editing?"Edit study session":"Add study session"} close={p.close}><FormInput label="Session" value={title} onChange={setTitle} placeholder="e.g. Trigonometry practice"/><FormInput label="Subject" value={subject} onChange={setSubject}/><div className="form-two"><FormInput label="Minutes" value={minutes} onChange={setMinutes} type="number"/><FormInput label="Date" value={date} onChange={setDate} type="date"/></div><ModalActions close={p.close} save={submit}/></Modal>}
function ScoreModal(p:{close:()=>void;add:(s:Score)=>void}){const [subject,setSubject]=useState("Maths"),[test,setTest]=useState(""),[obtained,setObtained]=useState(""),[max,setMax]=useState("40");return <Modal title="Record a score" close={p.close}><FormInput label="Subject" value={subject} onChange={setSubject}/><FormInput label="Assessment" value={test} onChange={setTest} placeholder="Unit test"/><div className="form-two"><FormInput label="Marks" value={obtained} onChange={setObtained} type="number"/><FormInput label="Out of" value={max} onChange={setMax} type="number"/></div><ModalActions close={p.close} save={()=>p.add({id:Date.now(),subject,test:test||"Assessment",obtained:Number(obtained)||0,max:Number(max)||40,date:today})}/></Modal>}
function ExamModal(p:{close:()=>void;add:(e:Exam)=>void}){const [name,setName]=useState(""),[subject,setSubject]=useState("Maths"),[date,setDate]=useState("2026-10-15"),[portion,setPortion]=useState("");const submit=()=>{const lessons=portion.split(",").map(title=>title.trim()).filter(Boolean).map((title,i)=>({id:Date.now()+i,title,done:false}));p.add(normalizeExam({id:Date.now(),name:name||"New exam",subject,date,portion:portion.trim(),lessons,progress:0,revisionRounds:0,practiceTests:0,confidence:0,weakAreas:""}));};return <Modal title="Add exam" close={p.close}><FormInput label="Exam name" value={name} onChange={setName}/><FormInput label="Subject" value={subject} onChange={setSubject}/><FormInput label="Date" value={date} onChange={setDate} type="date"/><FormInput label="Lessons / chapters" value={portion} onChange={setPortion} placeholder="Separate lessons with commas"/><small className="form-help">AvenroOS calculates progress from the lessons you add. You can add or remove lessons after creating the exam.</small><ModalActions close={p.close} save={submit}/></Modal>}
function App(){
 const [screen,setScreen]=useState<"welcome"|"app">("welcome");
 const [mode,setMode]=useState<"anonymous"|"account">("anonymous");
 const [loading,setLoading]=useState(true);
 const [error,setError]=useState("");
 const [authOpen,setAuthOpen]=useState(false);
 const [anonymousSetupOpen,setAnonymousSetupOpen]=useState(false);
 const [accountSetupOpen,setAccountSetupOpen]=useState(false);
 const [authMode,setAuthMode]=useState<"signin"|"signup">("signin");

 useEffect(()=>{
  let active=true;
  if(!supabase){setLoading(false);return;}

  const hydrateSession=async(session:any)=>{
   if(!session||!active)return;
   try{
    const user=session.user;
    const cloud=await loadCloudData(user.id);
    if(!active)return;
    window.__studentosData=cloud;
    window.__studentosEmail=user.email||"";
    window.__studentosUserId=user.id;
    sessionStorage.removeItem("studentos_pending_signup");
    setMode("account");
    setScreen("app");
   }catch(error){console.error("AvenroOS session hydration failed",error)}
  };

  // Let Supabase own browser/PWA session persistence. Its client already stores
  // and refreshes the session in localStorage, so keeping a second refresh-token
  // backup can race with token rotation and make a valid session look signed out.
  const {data:{subscription}}=supabase.auth.onAuthStateChange((event,session)=>{
   if(session){
    void hydrateSession(session);
   }else if(event==="SIGNED_OUT"&&active){
    window.__studentosData=undefined;
    window.__studentosEmail="";
    window.__studentosUserId="";
    setMode("anonymous");
    setScreen("welcome");
   }
  });

  void (async()=>{
   try{
    const {data,error}=await supabase.auth.getSession();
    if(error)console.error("AvenroOS session load failed",error);
    if(data.session)await hydrateSession(data.session);
   }catch(error){console.error("AvenroOS boot failed",error)}
   if(active)setLoading(false);
  })();

  return()=>{active=false;subscription.unsubscribe()};
 },[]);

 const enterAnonymous=()=>{setAnonymousSetupOpen(true)};
 const finishAccountSetup=async(displayName:string,journey:string,classLevel:string)=>{const data={...(window.__studentosData||blankData()),displayName:displayName.trim()||"Student",journey:journey.trim()||"Make meaningful progress",classLevel:classLevel.trim()};window.__studentosData=data;setAccountSetupOpen(false);if(window.__studentosUserId)await saveCloudData(window.__studentosUserId,data)};
 const finishAnonymousSetup=(displayName:string,journey:string,classLevel:string)=>{const data=blankData();data.displayName=displayName.trim()||"Student";data.journey=journey.trim()||"Make meaningful progress";data.classLevel=classLevel.trim();window.__studentosData=data;window.__studentosEmail="";window.__studentosUserId="";setAnonymousSetupOpen(false);setMode("anonymous");setScreen("app")};
 const exit=async()=>{if(supabase&&mode==="account")await supabase.auth.signOut();window.__studentosData=undefined;window.__studentosEmail="";window.__studentosUserId="";setMode("anonymous");setScreen("welcome")};
 const deleteAccount=async()=>{if(!supabase)return "Supabase is not connected.";const {error:deleteError}=await supabase.functions.invoke("delete-studentos-account",{method:"POST"});if(deleteError)return deleteError.message||"Account deletion failed.";await exit();return "";};

 const finishCloudSession=async(user:{id:string;email?:string|null})=>{const anonymousSnapshot=mode==="anonymous"?window.__studentosData:undefined;const cloud=anonymousSnapshot?anonymousSnapshot:await loadCloudData(user.id);if(anonymousSnapshot)await saveCloudData(user.id,cloud);window.__studentosData=cloud;window.__studentosEmail=user.email||"";window.__studentosUserId=user.id;const needsSetup=sessionStorage.getItem("studentos_pending_signup")==="1";sessionStorage.removeItem("studentos_pending_signup");setMode("account");setScreen("app");setAuthOpen(false);if(needsSetup)setAccountSetupOpen(true)};

 const social=async(provider:"google"|"notion")=>{
  setError("");
  if(authMode==="signup")sessionStorage.setItem("studentos_pending_signup","1");else sessionStorage.removeItem("studentos_pending_signup");
  if(!supabase){setError("Cloud sign-in needs the AvenroOS Supabase project connected.");return;}
  const {error:e}=await supabase.auth.signInWithOAuth({provider,options:{redirectTo:window.location.origin,scopes:undefined}});
  if(e)setError(e.message);
 };
 const emailAuth=async(email:string,code?:string):Promise<boolean>=>{
  setError("");
  if(!code){if(authMode==="signup")sessionStorage.setItem("studentos_pending_signup","1");else sessionStorage.removeItem("studentos_pending_signup");}
  if(!supabase){setError("Supabase is not connected yet. Add the AvenroOS Supabase environment variables first.");return false;}
  if(code){
   const result=await supabase.auth.verifyOtp({email,token:code.trim(),type:"email"});
   if(result.error){setError(result.error.message);return false;}
   if(result.data.session?.user){await finishCloudSession(result.data.session.user);return true;}
   setError("Verification succeeded, but no active session was returned. Please try again.");return false;
  }
  const result=await supabase.auth.signInWithOtp({email,options:{shouldCreateUser:true,emailRedirectTo:window.location.origin}});
  if(result.error){setError(result.error.message);return false;}
  return true;
 };

 if(loading)return <div className="welcome-shell auth-loading"><div><div className="auth-icon"><img src={AVENROOS_ICON} alt="" aria-hidden="true" /></div><strong>Loading AvenroOS…</strong></div></div>;
 if(screen==="app")return <AvenroOSApp mode={mode} onExit={exit} onDeleteAccount={deleteAccount} onSignIn={()=>{setAuthMode("signup");setAuthOpen(true);setScreen("welcome")}}/>;
 return <div className="welcome-shell">
  <header className="welcome-nav"><div className="welcome-brand"><div className="brand-mark"><img src={AVENROOS_ICON} alt="" aria-hidden="true" /></div><strong>AvenroOS</strong></div><div className="welcome-nav-actions"><button className="nav-auth-link" onClick={enterAnonymous}>Try anonymously</button><button className="nav-auth-btn" onClick={()=>{setAuthMode("signup");setAuthOpen(true)}}>Get started <ChevronRight size={16}/></button></div></header>
  <Welcome onAnonymous={enterAnonymous} openAuth={(m)=>{setAuthMode(m);setAuthOpen(true)}} onSocial={social} error={error}/>
  {anonymousSetupOpen&&<AnonymousSetupModal close={()=>setAnonymousSetupOpen(false)} continueSetup={finishAnonymousSetup} account={false}/>} {accountSetupOpen&&<AnonymousSetupModal close={()=>setAccountSetupOpen(false)} continueSetup={finishAccountSetup} account={true}/>}
  {authOpen&&<AuthModal mode={authMode} setMode={setAuthMode} close={()=>{setAuthOpen(false);setError("")}} onSocial={social} onEmail={emailAuth} error={error}/>}
 </div>
}

function AnonymousSetupModal(p:{close:()=>void;continueSetup:(displayName:string,journey:string,classLevel:string)=>void|Promise<void>;account:boolean}){const [name,setName]=useState(""),[journey,setJourney]=useState(""),[classLevel,setClassLevel]=useState("");return <div className="modal-backdrop auth-backdrop" onMouseDown={p.close}><div className="auth-card auth-modal setup-modal" onMouseDown={e=>e.stopPropagation()}><button className="auth-close icon-btn" onClick={p.close} aria-label="Close"><X size={18}/></button><div className="auth-icon"><img src={AVENROOS_ICON} alt="" aria-hidden="true" /></div><h1>{p.account?"Welcome to AvenroOS":"Let's set up your AvenroOS"}</h1><p>{p.account?"Your account is ready. Tell us a little about yourself so we can personalize your workspace.":"You're continuing anonymously, so we'll personalize your workspace without creating an account."}</p><label className="field"><span>What should we call you?</span><input value={name} onChange={e=>setName(e.target.value)} placeholder="Your name" autoFocus/></label><label className="field"><span>What would you like to name your journey?</span><input value={journey} onChange={e=>setJourney(e.target.value)} placeholder="e.g. 90%+ Mission, Road to Engineering"/></label><label className="field"><span>What class / year are you in?</span><select value={classLevel} onChange={e=>setClassLevel(e.target.value)} aria-label="Class or year"><option value="" disabled>Select your class / year</option><option value="Class 1">Class 1</option><option value="Class 2">Class 2</option><option value="Class 3">Class 3</option><option value="Class 4">Class 4</option><option value="Class 5">Class 5</option><option value="Class 6">Class 6</option><option value="Class 7">Class 7</option><option value="Class 8">Class 8</option><option value="Class 9">Class 9</option><option value="Class 10">Class 10</option><option value="Class 11">Class 11</option><option value="Class 12">Class 12</option><option value="University">University</option></select></label><button className="primary-btn auth-submit reference-continue" onClick={()=>p.continueSetup(name,journey,classLevel)} disabled={!name.trim()||!journey.trim()}>Enter AvenroOS <ChevronRight size={17}/></button><small className="auth-note">{p.account?"You can change these preferences anytime in Settings.":"Anonymous mode stays on this device/session and is not saved to a cloud account."}</small></div></div>}

function AuthModal(p:{mode:"signin"|"signup";setMode:(m:"signin"|"signup")=>void;close:()=>void;onSocial:(x:"google"|"notion")=>void;onEmail:(email:string,code?:string)=>Promise<boolean>;error:string}){
 const [email,setEmail]=useState(""),[code,setCode]=useState(""),[codeSent,setCodeSent]=useState(false);
 const errorIsSent=p.error==="CODE_SENT";
 const sendCode=async()=>{if(!email.trim())return;const ok=await p.onEmail(email.trim());if(ok)setCodeSent(true)};
 const verify=async()=>{if(code.trim().length!==6)return;await p.onEmail(email.trim(),code.trim())};
 return <div className="modal-backdrop auth-backdrop" onMouseDown={p.close}><div className="auth-card auth-modal auth-reference-modal" onMouseDown={e=>e.stopPropagation()}>
  <button className="auth-close icon-btn" onClick={p.close} aria-label="Close"><X size={18}/></button>
  <div className="auth-icon"><img src={AVENROOS_ICON} alt="" aria-hidden="true" /></div>
  <h1>Log in or sign up</h1>
  <p>Save your AvenroOS workspace in the cloud and pick up where you left off on any device.</p>
  <button className="social-btn google-auth" onClick={()=>p.onSocial("google")}><span className="google-g">G</span> Continue with Google <ChevronRight size={16}/></button>
  <button className="social-btn notion-auth" onClick={()=>p.onSocial("notion")}><span className="notion-mark">N</span> Continue with Notion <ChevronRight size={16}/></button>
  <div className="auth-divider"><span>OR</span></div>
  {!codeSent ? <>
   <label className="field"><span>Email address</span><input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email" autoFocus/></label>
   <button className="primary-btn auth-submit reference-continue" onClick={sendCode} disabled={!email.trim()}>Send verification code <ChevronRight size={17}/></button>
  </> : <>
   <label className="field"><span>Verification code</span><input inputMode="numeric" autoComplete="one-time-code" value={code} onChange={e=>setCode(e.target.value.replace(/\D/g,"").slice(0,6))} placeholder="6-digit code" autoFocus/></label>
   <p className="auth-code-hint">We sent a verification code to <strong>{email}</strong>.</p>
   <button className="primary-btn auth-submit reference-continue" onClick={verify} disabled={code.length!==6}>Verify & continue <ChevronRight size={17}/></button>
   <button className="text-btn auth-resend" onClick={sendCode}>Resend code</button>
   <button className="text-btn auth-change-email" onClick={()=>{setCode("");setCodeSent(false)}}>Use a different email</button>
  </>}
  {errorIsSent?<div className="auth-success">Verification code sent. Check your email.</div>:p.error&&<div className="auth-error">{p.error}</div>}
  <div className="auth-switch">{p.mode==="signup"?<><span>Already have an account?</span><button onClick={()=>p.setMode("signin")}>Log in</button></>:<><span>New to AvenroOS?</span><button onClick={()=>p.setMode("signup")}>Sign up</button></>}</div>
  <small className="auth-note">Email sign-in uses a one-time verification code. No password is required.</small>
 </div></div>
}

function Welcome(p:{onAnonymous:()=>void;openAuth:(m:"signin"|"signup")=>void;onSocial:(x:"google"|"notion")=>void;error:string}){
 const [intro,setIntro]=useState(true);
 const [scrollY,setScrollY]=useState(0);
 useEffect(()=>{
   const onScroll=()=>setScrollY(window.scrollY);
   window.addEventListener("scroll",onScroll,{passive:true});
   const t=window.setTimeout(()=>setIntro(false),1450);
   return()=>{window.removeEventListener("scroll",onScroll);window.clearTimeout(t)};
 },[]);
 const drift=(speed:number)=>({transform:`translate3d(0,${Math.min(120,scrollY*speed)}px,0)`});
 return <>
  {intro&&<div className="landing-intro-v2" aria-hidden="true"><div className="landing-intro-mark"><img src={AVENROOS_ICON} alt="" aria-hidden="true" /></div><div className="landing-intro-word">AVENROOS</div><div className="landing-intro-line"/></div>}
  <main className="welcome-main-v2"><div className="scroll-object-v2" style={{transform:`translate3d(0,${Math.min(180,scrollY*.22)}px,0) rotate(${Math.min(28,scrollY*.035)}deg)`}}><div className="scroll-object-core"><img src={AVENROOS_ICON} alt="" aria-hidden="true" /></div></div>
  <section className="landing-hero-v2">
   <div className="landing-hero-copy">
    <div className="landing-eyebrow"><span/> AVENROOS · YOUR SCHOOL OS</div>
    <h1>Know what matters.<br/><em>Do what matters.</em></h1>
    <div className="landing-punchline">Turn school chaos into a system.</div>
    <p>One calm workspace for your tasks, exams, scores, focus sessions and the journey you're building beyond school.</p>
    <div className="landing-actions-v2">
      <button className="landing-primary-v2" onClick={()=>p.openAuth("signup")}>Build my workspace <ChevronRight size={17}/></button>
      <button className="landing-text-v2" onClick={p.onAnonymous}>Explore anonymously <ArrowUpRight size={16}/></button>
    </div>
    <div className="landing-proof-v2"><span>NO CARD REQUIRED</span><i/> <span>ANONYMOUS FIRST</span><i/> <span>SYNC WHEN YOU SIGN IN</span></div>
   </div>
   <div className="landing-stage-v2"><div className="stage-orbit stage-orbit-a" style={drift(-.08)}/><div className="stage-orbit stage-orbit-b" style={drift(.12)}/>
    <div className="stage-glow"/>
    <div className="stage-label">LIVE WORKSPACE <span>●</span></div>
    <div className="stage-window">
      <div className="stage-top"><div className="stage-brand"><div className="stage-mark"><img src={AVENROOS_ICON} alt="" aria-hidden="true" /></div> AVENROOS</div><span>MONDAY · 08:42</span></div>
      <div className="stage-body">
       <span className="stage-kicker">YOUR NEXT MOVE</span>
       <h2>Finish what<br/><b>matters today.</b></h2>
       <div className="stage-focus"><div><span>FOCUS</span><strong>25:00</strong></div><div><span>TASKS</span><strong>4 open</strong></div><div><span>EXAMS</span><strong>2 next</strong></div></div>
       <div className="stage-line"><span>JOURNEY</span><b>68%</b><i><em/></i></div>
      </div>
    </div>
    <div className="stage-float stage-score" style={drift(.16)}><TrendingUp size={14}/><span>Score average</span><b>92%</b></div>
    <div className="stage-float stage-mission" style={drift(-.12)}><Target size={14}/><span>Today</span><b>Maths · 45 min</b></div>
   </div>
  </section>

  <section className="landing-manifesto-v2">
   <div className="manifesto-index">01 / THE IDEA</div>
   <div><h2>School is already complicated.<br/><em>Your tools shouldn't be.</em></h2><p>AvenroOS turns the scattered pieces of school into one clear system. You decide the goal. AvenroOS keeps the next move visible.</p></div>
  </section>

  <section className="landing-modules-v2">
   <div className="module-heading"><span>02 / THE SYSTEM</span><h2>Everything you need.<br/><em>Nothing you don't.</em></h2></div>
   <div className="module-grid-v2">
    <article className="module-large"><div className="module-number">01</div><BookOpen/><h3>Study</h3><p>Turn a pile of schoolwork into a focused list of things you can actually finish.</p><div className="module-demo"><span>UP NEXT</span><b>Quadratics practice</b><small>45 min · Today</small></div></article>
    <article className="module-dark"><div className="module-number">02</div><CalendarDays/><h3>Exams</h3><p>Know what is coming, what you've covered, and where your preparation stands.</p><div className="module-demo"><span>NEXT EXAM</span><b>Mathematics</b><small>12 days · 6 lessons</small></div></article>
    <article className="module-dark"><div className="module-number">03</div><TrendingUp/><h3>Scores</h3><p>Keep assessments in one place and make progress visible over time.</p><div className="module-demo score-demo"><span>AVERAGE</span><b>92%</b><small>↑ 6% this term</small></div></article>
    <article className="module-accent"><div className="module-number">04</div><Clock3/><h3>Focus</h3><p>When it's time to work, remove the noise and start the clock.</p><div className="module-demo timer-demo"><b>25:00</b><small>ONE SESSION · ONE OBJECTIVE</small></div></article>
    <article className="module-wide"><div><div className="module-number">05</div><Target/><h3>Journey</h3><p>Name the thing you're working toward and keep it visible. College, a score, a skill — it's yours.</p></div><div className="journey-demo"><span>YOUR JOURNEY</span><b>90%+ MISSION</b><i><em/></i></div></article>
   </div>
  </section>

  <section className="landing-close-v2">
   <span>03 / START HERE</span>
   <h2>Your next move<br/><em>starts here.</em></h2>
   <div className="landing-close-actions"><button className="landing-primary-v2" onClick={()=>p.openAuth("signup")}>Get started <ChevronRight size={17}/></button><button className="landing-text-v2" onClick={p.onAnonymous}>Try anonymously <ArrowUpRight size={16}/></button></div>
  </section>
 </main>
 </>
}
function pageTitle(p:Page){return {dashboard:"Dashboard",study:"Study",exams:"Exams",scores:"Scores",focus:"Focus",journey:"Journey",settings:"Settings"}[p]}

export default App;