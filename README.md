# VPS Configuration Backup

## Estructura

```
.
├── docker/
│   ├── docker-compose.yml
│   ├── .env.example
│   ├── Makefile
│   ├── nginx/
│   └── system-nginx-configs/
├── nginx/
│   ├── nginx.conf
│   └── sites-available/
├── ssh/
│   ├── sshd_config
│   └── sshd_config.d/
├── ufw/
│   ├── current-rules.txt
│   ├── user.rules
│   ├── user6.rules
│   └── [otros archivos de configuración]
└── system/
    ├── running-services.txt
    ├── docker-containers.txt
    ├── memory-info.txt
    ├── disk-info.txt
    ├── system-info.txt
    ├── root-crontab.txt
    ├── hosts
    ├── hostname
    └── resolv.conf
```

## Restaurar en nuevo VPS

### 1. SSH
```bash
cp ssh/sshd_config /etc/ssh/sshd_config
cp -r ssh/sshd_config.d/* /etc/ssh/sshd_config.d/
systemctl restart sshd
```

### 2. UFW
```bash
cp ufw/user.rules /etc/ufw/user.rules
cp ufw/user6.rules /etc/ufw/user6.rules
cp ufw/ufw.conf /etc/ufw/ufw.conf
ufw enable
```

### 3. Nginx
```bash
cp nginx/nginx.conf /etc/nginx/nginx.conf
cp nginx/sites-available/* /etc/nginx/sites-available/
ln -s /etc/nginx/sites-available/zta /etc/nginx/sites-enabled/zta
ln -s /etc/nginx/sites-available/admin-zta /etc/nginx/sites-enabled/admin-zta
ln -s /etc/nginx/sites-available/download-zta /etc/nginx/sites-enabled/download-zta
systemctl restart nginx
```

### 4. Docker
```bash
cd docker/
cp .env.example .env
# Editar .env con valores reales
docker-compose up -d
```
