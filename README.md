<div align="center">

# Inside Light EDR

**A free, interactive course on building a lightweight Windows EDR — in English and Persian.**

[English](https://ret2voidx.github.io/) · [فارسی](https://ret2voidx.github.io/fa/) · [Source code](https://github.com/Ret2Voidx/Light-EDR)

![Ret2Void](https://img.shields.io/badge/Ret2Void-learn-7C3AED?style=flat-square&labelColor=0B0F14)
![Light EDR](https://img.shields.io/badge/Light%20EDR-v0.5.0-7C3AED?style=flat-square&labelColor=0B0F14)
![Languages](https://img.shields.io/badge/languages-EN%20%C2%B7%20FA-7C3AED?style=flat-square&labelColor=0B0F14)

</div>

---

[Light EDR](https://github.com/Ret2Voidx/Light-EDR) is a lightweight Endpoint Detection and Response sensor for Windows, written in C and C++.
This site walks through how it is built, one layer at a time, with diagrams, real measurements and
three interactive labs.

| Chapter | What you learn |
|---|---|
| Telemetry | Getting process events out of the kernel with ETW and TDH, without a driver |
| Storage | A bounded queue that drops instead of blocking, a filter, SQLite in WAL mode |
| Detection | A restricted YAML reader, a Sigma-style condition grammar, 18 ATT&CK-mapped rules |
| Injection | Finding injected code from user mode with memory scanning |
| Validation | Atomic Red Team, near misses, a one-hour soak and a load test |
| Console | A read-only WPF dashboard over the sensor's database |

**Labs:** fill the event queue until it drops · run eight real rules against an event you build ·
scan a process region by region the way the scanner does.

Every number on the site comes from a real run on a test VM. Limitations are stated, not hidden.

## Run it locally

It is a static site with no build step:

```
python -m http.server 8000
```

then open `http://localhost:8000/`.

Animations follow the system's reduced-motion setting and can be switched off from the top bar.

---

<sub>Ret2Void · Light EDR</sub>
