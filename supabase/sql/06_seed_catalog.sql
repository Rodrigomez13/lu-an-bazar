begin;

insert into public.products (
  code, slug, name, category, brand, price, description, featured, is_new,
  color, material, dimensions, features, keywords, image_url, published
)
values
('NEG-040','balanza-digital-40kg','Balanza digital comercial 40 kg','Hogar','Hengda',30500,'Balanza electrónica con cálculo de precio, pantalla triple y capacidad de hasta 40 kg.',true,true,'Blanco y azul','Acero inoxidable y plástico','Bandeja de 33,3 × 47,3 cm',array['Capacidad máxima de 40 kg','División de 2 g','Cálculo de peso y precio'],array['balanza','comercio','peso','digital'],'/images/products/balanza-digital-40kg.jpg',true),
('CUI-160','clipper-waer-pro','Máquina de cortar pelo Waer Pro','Cuidado personal','Waer',null,'Cortadora profesional recargable con pantalla digital y peines para distintas alturas.',true,false,'Dorado','Metal y plástico','Kit con 8 peines guía',array['Cuchilla de titanio cerámico','Pantalla digital','Diseño recargable USB'],array['clipper','cortadora','barbería','cabello'],'/images/products/clipper-waer-pro.jpg',true),
('TEC-165','foco-camara-wifi','Foco cámara Wi-Fi','Tecnología','Smart Camera',16500,'Cámara de seguridad Wi-Fi con formato de foco para supervisar ambientes desde el celular.',true,true,'Blanco','Plástico','Rosca tipo foco',array['Conexión Wi-Fi','Visualización desde el celular','Formato de instalación simple'],array['cámara','seguridad','wifi','foco'],'/images/products/foco-cámara.jpg',true),
('SAL-175','medidor-glucosa-kit','Kit medidor de glucosa','Salud y bienestar','Ecopower',17500,'Kit doméstico para medición de glucosa con medidor, lanceta y 50 tiras reactivas.',false,true,'Blanco','Plástico','Kit compacto',array['Incluye 50 tiras','Lanceta incluida','Expulsión automática de tiras'],array['glucosa','salud','medidor','tiras'],'/images/products/medidor-glucosa.jpg',true),
('ELE-280','mixer-raf-5-en-1','Mixer RAF 5 en 1','Electrodomésticos','RAF',28000,'Mixer multifunción con accesorios para mezclar, batir, triturar y procesar alimentos.',true,true,'Negro','Acero y plástico','Set de 5 piezas',array['Set 5 en 1','Vaso medidor','Batidor y procesador incluidos'],array['mixer','licuadora','batidor','cocina'],'/images/products/mixer-5en1.jpg',true),
('ELE-150','pava-electrica-raf-1500w','Pava eléctrica RAF 1500 W','Electrodomésticos','RAF',14500,'Pava eléctrica de 2 litros con base giratoria, indicador luminoso y apagado automático.',false,false,'Colores surtidos','Acero inoxidable y plástico','Capacidad 2 L',array['Potencia de 1500 W','Base giratoria 360°','Apagado automático'],array['pava','hervidor','agua','mate'],'/images/products/pava-eléctrica-1500W.png',true),
('ELE-200','pava-electrica-raf-2000w','Pava eléctrica RAF 2000 W','Electrodomésticos','RAF',14500,'Hervidor eléctrico de 2 litros, libre de BPA y disponible en diferentes colores.',false,false,'Colores surtidos','Plástico libre de BPA','Capacidad 2 L',array['Potencia de 2000 W','Apagado automático','Indicador luminoso LED'],array['pava','hervidor','eléctrica','cocina'],'/images/products/pava-eléctrica-2000W.jpg',true),
('ELE-140','plancha-vapor-raf-1400w','Plancha a vapor RAF 1400 W','Electrodomésticos','RAF',null,'Plancha eléctrica con vapor continuo, rociador y control de temperatura.',false,true,'Colores surtidos','Plástico y base cerámica','Tamaño estándar',array['Potencia de 1400 W','Vapor continuo','Control de temperatura'],array['plancha','vapor','ropa','hogar'],'/images/products/plancha-vapor-1400W.jpg',true),
('CUI-426','planchita-cabello-raf','Planchita de cabello RAF 2 en 1','Cuidado personal','RAF',9500,'Alisador y rizador 2 en 1 con placas de aluminio y revestimiento cerámico.',false,false,'Gris y naranja','Plástico y cerámica','Placas de 25 × 95 mm',array['Función 2 en 1','Cable giratorio 360°','Traba de seguridad'],array['planchita','alisador','cabello','rulos'],'/images/products/planchita-cabello.jpg',true),
('CUI-4818','secador-cabello-luo-5en1','Secador de cabello LUO 5 en 1','Cuidado personal','LUO',null,'Secador profesional de alta potencia con cinco accesorios para distintos estilos.',true,false,'Negro','Plástico','Kit con 5 accesorios',array['Potencia anunciada de 4000 W','Aire frío y caliente','Incluye difusor y concentradores'],array['secador','cabello','peluquería','difusor'],'/images/products/secador-cabello.jpg',true),
('COC-104','set-jarra-vasos-frutilla','Set de jarra y vasos Frutilla','Cocina y bebidas','Genérica',null,'Juego de vidrio con una jarra y cuatro vasos decorados con diseño de frutillas.',false,true,'Transparente y rojo','Vidrio','Jarra + 4 vasos',array['Set de 5 piezas','Diseño estampado','Ideal para bebidas frías'],array['jarra','vasos','vidrio','frutilla'],'/images/products/set-vasos-jarra.jpg',true),
('SAL-2740','tensiometro-digital-ecopower','Tensiómetro digital Ecopower','Salud y bienestar','Ecopower',17500,'Tensiómetro electrónico de brazo con pantalla digital y memoria de mediciones.',false,false,'Blanco','Plástico y brazalete textil','Equipo de brazo',array['Pantalla digital','Memoria de mediciones','Alimentación USB'],array['tensiómetro','presión','salud','digital'],'/images/products/tensiómetro-digital.jpg',true),
('COC-650','termo-luo-650ml','Termo LUO 650 ml','Cocina y bebidas','LUO',11500,'Termo compacto con manija rebatible, pico cebador y variedad de colores.',false,true,'Colores surtidos','Acero inoxidable y plástico','Capacidad 650 ml',array['Pico cebador','Manija rebatible','Base de acero inoxidable'],array['termo','mate','bebidas','650ml'],'/images/products/termolar-chico.jpg',true),
('COC-1900','termo-grande-frio-caliente','Termo grande frío/caliente','Cocina y bebidas','Marca a confirmar',27900,'Termo de gran capacidad con manija, pico vertedor y vaso térmico incluido.',true,false,'Rosa o rojo','Acero inoxidable y plástico','Gran capacidad',array['Conserva frío y calor','Incluye vaso','Manija para transporte'],array['termo','grande','frío','caliente'],'/images/products/termolar-grande-frio-caliente.jpg',true)
on conflict (code) do update set
  name = excluded.name,
  category = excluded.category,
  brand = excluded.brand,
  price = excluded.price,
  description = excluded.description,
  featured = excluded.featured,
  is_new = excluded.is_new,
  color = excluded.color,
  material = excluded.material,
  dimensions = excluded.dimensions,
  features = excluded.features,
  keywords = excluded.keywords,
  image_url = excluded.image_url,
  published = excluded.published,
  archived_at = null;

commit;
