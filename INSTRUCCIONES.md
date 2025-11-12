# Instrucciones para subir a GitHub

## 1. Crear repositorio en GitHub

1. Ve a https://github.com/new
2. Nombre del repositorio: `vps-config-backup`
3. Descripción: `Backup de configuraciones VPS`
4. Selecciona: **Private**
5. NO inicialices con README, .gitignore, o license
6. Clic en "Create repository"

## 2. Subir configuraciones

```bash
cd ~/vps-config-backup
git push -u origin main
```

## 3. Verificar

Ve a: https://github.com/tunek12421/vps-config-backup

---

## Contenido del backup

45 archivos con configuraciones completas:
- Nginx (sistema + Docker)
- SSH
- UFW/Firewall
- Docker Compose
- Información del sistema
