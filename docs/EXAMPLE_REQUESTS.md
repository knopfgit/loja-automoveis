# EXAMPLE REQUESTS

Exemplos com `curl`. Base: `http://localhost:3000/api`.
Defina `TOKEN` após o login.

## Autenticação

```bash
# Login (ADMIN)
curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@autodealer.local","password":"Admin@123"}'

TOKEN="<accessToken da resposta>"

# Usuário atual
curl -s http://localhost:3000/api/auth/me -H "Authorization: Bearer $TOKEN"

# Refresh
curl -s -X POST http://localhost:3000/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refreshToken":"<refreshToken>"}'
```

## Catálogo de ficha técnica + cadastro de veículo

```bash
# 1) Marcas / modelos / anos / versões
curl -s http://localhost:3000/api/vehicle-specs/brands
curl -s "http://localhost:3000/api/vehicle-specs/models?brandId=volkswagen"
curl -s "http://localhost:3000/api/vehicle-specs/years?modelId=volkswagen__t-cross"
curl -s "http://localhost:3000/api/vehicle-specs/search?brand=Volkswagen&model=T-Cross&year=2023"

# 2) Cadastrar veículo
curl -s -X POST http://localhost:3000/api/vehicles \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"brand":"Volkswagen","model":"T-Cross","version":"200 TSI","manufactureYear":2022,"modelYear":2023,"announcedPrice":119900,"purchasePrice":95000,"availableForAd":true}'

VEHICLE_ID="<id retornado>"

# 3) Preencher a ficha técnica automaticamente
curl -s -X POST http://localhost:3000/api/vehicles/$VEHICLE_ID/apply-specs \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"brand":"Volkswagen","model":"T-Cross","year":2023,"manualOverrides":{"color":"Prata"}}'

# 4) Disponibilizar para venda
curl -s -X POST http://localhost:3000/api/vehicles/$VEHICLE_ID/status \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"status":"AVAILABLE","reason":"pronto para anúncio"}'
```

## Upload de mídia / documento (multipart)

```bash
curl -s -X POST http://localhost:3000/api/vehicles/$VEHICLE_ID/media/upload \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@/caminho/foto.jpg"

curl -s -X POST http://localhost:3000/api/documents/upload \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@/caminho/crlv.pdf" \
  -F "documentTypeId=<id>" -F "ownerType=VEHICLE" -F "vehicleId=$VEHICLE_ID"
```

## Peças e manutenção

```bash
# Movimentar estoque
curl -s -X POST http://localhost:3000/api/parts/<partId>/movements \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"type":"ENTRY","quantity":10,"unitCost":35}'

# Abrir manutenção e aplicar peça
curl -s -X POST http://localhost:3000/api/maintenances \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"vehicleId":"'$VEHICLE_ID'","type":"REVISION","laborCost":400}'

curl -s -X POST http://localhost:3000/api/maintenances/<id>/parts \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"partId":"<partId>","quantity":2}'

curl -s -X POST http://localhost:3000/api/maintenances/<id>/complete \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"laborCost":400,"nextRevisionMileage":50000}'
```

## Venda + comissão + DRE

```bash
curl -s -X POST http://localhost:3000/api/sales \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"vehicleId":"'$VEHICLE_ID'","customerId":"<id>","negotiatedPrice":116000}'

curl -s -X PATCH http://localhost:3000/api/sales/<saleId>/status \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"status":"COMPLETED","finalPrice":116000}'

curl -s http://localhost:3000/api/dre/vehicle/$VEHICLE_ID \
  -H "Authorization: Bearer $TOKEN"
```

## Falar com especialista (público)

```bash
curl -s -X POST http://localhost:3000/api/public/leads/specialist-contact \
  -H "Content-Type: application/json" \
  -d '{"vehicleId":"'$VEHICLE_ID'","name":"Pedro","phone":"54988887777"}'
# -> { leadId, assignedSeller, whatsappUrl, status }
```

## Cliente: favoritos, consentimento, privacidade

```bash
CUST_TOKEN="<token de maria@cliente.com>"

curl -s -X POST http://localhost:3000/api/favorites/$VEHICLE_ID -H "Authorization: Bearer $CUST_TOKEN"
curl -s http://localhost:3000/api/favorites -H "Authorization: Bearer $CUST_TOKEN"

curl -s -X POST http://localhost:3000/api/consents \
  -H "Content-Type: application/json" \
  -d '{"sessionId":"abc","termsVersion":"1.0","consents":[{"category":"ESSENTIAL","granted":true},{"category":"MARKETING","granted":false}]}'

curl -s -X POST http://localhost:3000/api/privacy/export-request -H "Authorization: Bearer $CUST_TOKEN"
```

## Catálogo público + filtros

```bash
curl -s "http://localhost:3000/api/public/vehicles?brand=Volkswagen&priceMax=130000&page=1&limit=12&sortBy=announcedPrice&sortOrder=asc"
curl -s http://localhost:3000/api/public/vehicles/featured
curl -s http://localhost:3000/api/public/filters
curl -s http://localhost:3000/api/public/store/location
```

## Relatórios (CSV)

```bash
curl -s "http://localhost:3000/api/reports/vehicles-stock?format=csv" \
  -H "Authorization: Bearer $TOKEN" -o estoque.csv
```
