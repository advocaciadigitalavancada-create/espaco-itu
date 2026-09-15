/**
 * ==============================================================================
 * ESPAÇO ITU — Pizza Artesanal Fermentação 48h & Café Especial
 * Rodovia Dr. Antônio Luiz Moura Gonzaga, 1895 — Rio Tavares, Florianópolis - SC
 *
 * API Serverless Google Apps Script & Google Sheets
 * Desenvolvido por WorkAround TI
 *
 * WhatsApp Oficial: +55 (48) 98860-5923 | Instagram: @espaco.itu
 * PIN de Segurança Padrão: 4895 (DDD 48 + Moura Gonzaga 1895)
 * ==============================================================================
 */

const SECURITY_PIN = "4895";
const SHEET_CONFIG = "Config";
const SHEET_CAFE = "CafeManha";
const SHEET_PIZZAS = "PizzasNoite";
const SHEET_AVISOS = "Avisos";

/**
 * Endpoint GET: Leitura pública e instantânea dos cardápios e status do Espaço ITU
 */
function doGet(e) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    ensureStructure(ss);

    const configData = readConfigSheet(ss);
    const cafeData = readMenuSheet(ss, SHEET_CAFE);
    const pizzasData = readMenuSheet(ss, SHEET_PIZZAS);
    const avisosData = readAvisosSheet(ss);

    const payload = {
      status: "success",
      estabelecimento: "Espaço Itu — Pizza 48h & Café Especial",
      timestamp: new Date().toISOString(),
      data: {
        config: configData,
        cafe_manha: cafeData,
        pizzas_noite: pizzasData,
        avisos: avisosData
      }
    };

    return ContentService.createTextOutput(JSON.stringify(payload))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    const errPayload = {
      status: "error",
      message: err.toString(),
      timestamp: new Date().toISOString()
    };
    return ContentService.createTextOutput(JSON.stringify(errPayload))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Endpoint POST: Gravação e atualização segura autenticada via PIN 4895
 */
function doPost(e) {
  try {
    let postData;
    if (e && e.postData && e.postData.contents) {
      postData = JSON.parse(e.postData.contents);
    } else if (e && e.parameter) {
      postData = e.parameter;
    } else {
      throw new Error("Nenhum dado recebido no corpo da requisição POST.");
    }

    // Validação estrita do PIN de segurança
    const pin = String(postData.pin || postData.auth_pin || "").trim();
    if (pin !== SECURITY_PIN) {
      return ContentService.createTextOutput(JSON.stringify({
        status: "error",
        message: "PIN de segurança inválido. Acesso negado."
      })).setMimeType(ContentService.MimeType.JSON);
    }

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    ensureStructure(ss);

    // Teste de conexão simples
    if (postData.action === "test" || postData.action === "ping") {
      return ContentService.createTextOutput(JSON.stringify({
        status: "success",
        message: "Conexão com a planilha do Espaço ITU estabelecida com sucesso!",
        timestamp: new Date().toISOString()
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // Alteração rápida de status de item (Disponível / Esgotado / Destaque do Dia)
    if (postData.action === "toggle_item_status" && postData.sheet && postData.id) {
      const updated = updateItemStatus(ss, postData.sheet, postData.id, postData.new_status);
      updateTimestamp(ss);
      return ContentService.createTextOutput(JSON.stringify({
        status: "success",
        message: "Status do item atualizado com sucesso.",
        updated: updated,
        timestamp: new Date().toISOString()
      })).setMimeType(ContentService.MimeType.JSON);
    }

    const data = postData.data || postData;

    // Atualiza Configurações
    if (data.config) {
      writeConfigSheet(ss, data.config);
    }

    // Atualiza Café da Manhã
    if (data.cafe_manha || data.CafeManha) {
      writeMenuSheet(ss, SHEET_CAFE, data.cafe_manha || data.CafeManha);
    }

    // Atualiza Pizzas da Noite
    if (data.pizzas_noite || data.PizzasNoite) {
      writeMenuSheet(ss, SHEET_PIZZAS, data.pizzas_noite || data.PizzasNoite);
    }

    // Atualiza Avisos
    if (data.avisos || data.Avisos) {
      writeAvisosSheet(ss, data.avisos || data.Avisos);
    }

    // Atualiza Timestamp de modificação
    updateTimestamp(ss);

    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      message: "Cardápios e configurações do Espaço ITU salvos com sucesso.",
      timestamp: new Date().toISOString()
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: err.toString(),
      timestamp: new Date().toISOString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Criação e estruturação automática das 4 abas com design executivo
 */
function ensureStructure(ss) {
  // 1. Aba Config
  let sheetConfig = ss.getSheetByName(SHEET_CONFIG);
  if (!sheetConfig) {
    sheetConfig = ss.insertSheet(SHEET_CONFIG);
    sheetConfig.appendRow(["Chave", "Valor", "Descrição"]);
    sheetConfig.getRange("A1:C1").setFontWeight("bold").setBackground("#1F2937").setFontColor("#F9FAFB");

    sheetConfig.appendRow(["nome_comercial", "Espaço Itu — Pizza 48h & Café Especial", "Nome da casa"]);
    sheetConfig.appendRow(["endereco", "Rodovia Dr. Antônio Luiz Moura Gonzaga, 1895 — Rio Tavares", "Endereço físico"]);
    sheetConfig.appendRow(["telefone_oficial", "+55 (48) 98860-5923", "Telefone WhatsApp balcão"]);
    sheetConfig.appendRow(["whatsapp_link", "https://wa.me/5548988605923", "Link direto WhatsApp"]);
    sheetConfig.appendRow(["instagram", "@espaco.itu", "Perfil oficial"]);
    sheetConfig.appendRow(["horario_cafe", "Terça a Domingo: 07h30 às 18h00", "Turno matutino/vespertino"]);
    sheetConfig.appendRow(["horario_pizza", "Terça a Domingo: 18h00 às 23h00", "Turno noturno"]);
    sheetConfig.appendRow(["dia_fechado", "Segunda-feira (Descanso de produção)", "Dia de folga"]);
    sheetConfig.appendRow(["status_loja", "Aberto", "Status geral da loja"]);
    sheetConfig.appendRow(["ultima_atualizacao", new Date().toISOString(), "Carimbo da última modificação"]);
  }

  // 2. Aba CafeManha
  let sheetCafe = ss.getSheetByName(SHEET_CAFE);
  if (!sheetCafe) {
    sheetCafe = ss.insertSheet(SHEET_CAFE);
    sheetCafe.appendRow(["ID", "Categoria", "Nome", "Descricao", "Preco_R$", "Status", "Destaque", "Ativo"]);
    sheetCafe.getRange("A1:H1").setFontWeight("bold").setBackground("#8B5E3C").setFontColor("#FFFFFF");

    const itensCafe = [
      ["cafe_coado", "Café Especial", "Café Coado Filtrado Especial", "Grãos nobres selecionados, métodos artesanais filtrados na hora.", "12.00", "Disponível", "SIM", "SIM"],
      ["espresso_duplo", "Café Especial", "Espresso Duplo / Cappuccino Italiano", "Dose dupla de café espresso com crema aveludada ou leite vaporizado cremoso.", "14.00", "Disponível", "NÃO", "SIM"],
      ["croissant_frutas", "Confeitaria Artesanal", "Croissant Folhado com Geleia", "Massa folhada francesa amanteigada e crocante com geleia da casa.", "18.00", "Destaque do Dia", "SIM", "SIM"],
      ["avocado_toast", "Brunch Salgado", "Avocado Toast no Pão Rústico", "Pão artesanal tostado na manteiga, abacate temperado e ovos caipiras.", "28.00", "Disponível", "SIM", "SIM"],
      ["torta_basca", "Vitrine de Doces", "Torta Basca Dourada (Cheesecake)", "Fatia da consagrada torta basca dourada, cremosa por dentro e caramelizada por fora.", "18.00", "Destaque do Dia", "SIM", "SIM"],
      ["queijadinha_paulista", "Vitrine de Doces", "Queijadinha Tradicional Paulista", "Receita artesanal com queijo curado e coco fresco ralado.", "10.00", "Disponível", "NÃO", "SIM"],
      ["smoothie_natural", "Bebidas Geladas", "Smoothie & Sucos Naturais", "Frutas frescas batidas na hora sem adição de conservantes.", "16.00", "Disponível", "NÃO", "SIM"]
    ];

    itensCafe.forEach(row => sheetCafe.appendRow(row));
  }

  // 3. Aba PizzasNoite
  let sheetPizzas = ss.getSheetByName(SHEET_PIZZAS);
  if (!sheetPizzas) {
    sheetPizzas = ss.insertSheet(SHEET_PIZZAS);
    sheetPizzas.appendRow(["ID", "Categoria", "Nome", "Descricao", "Preco_R$", "Status", "Destaque", "Ativo"]);
    sheetPizzas.getRange("A1:H1").setFontWeight("bold").setBackground("#991B1B").setFontColor("#FFFFFF");

    const itensPizza = [
      ["pizza_salmao", "Especiais da Casa", "Pizza de Salmão Especial", "Massa 48h, salmão fresco em lâminas, cream cheese maçaricado, molho tarê artesanal e gergelim.", "78.00", "Destaque do Dia", "SIM", "SIM"],
      ["pizza_margherita", "Clássicas 48h", "Pizza Margherita Autoral", "Massa 48h, molho de tomate pelado italiano, mozzarella premium e folhas frescas de manjericão.", "62.00", "Disponível", "SIM", "SIM"],
      ["pizza_calabresa", "Tradicionais", "Calabresa Paulista com Cebola Roxa", "Massa 48h, calabresa nobre fatiada fina, cebola roxa fresca marinada e azeitonas pretas.", "58.00", "Disponível", "NÃO", "SIM"],
      ["pizza_4queijos", "Especiais", "Quatro Queijos Nobres", "Massa 48h, gorgonzola curado, catupiry original, provolone defumado e mozzarella.", "68.00", "Disponível", "NÃO", "SIM"],
      ["pizza_parma", "Especiais da Casa", "Parma com Rúcula & Parmesão", "Massa 48h, presunto tipo parma curado, rúcula selvagem fresca e lascas de parmesão de montanha.", "75.00", "Destaque do Dia", "SIM", "SIM"]
    ];

    itensPizza.forEach(row => sheetPizzas.appendRow(row));
  }

  // 4. Aba Avisos
  let sheetAvisos = ss.getSheetByName(SHEET_AVISOS);
  if (!sheetAvisos) {
    sheetAvisos = ss.insertSheet(SHEET_AVISOS);
    sheetAvisos.appendRow(["ID", "Titulo", "Mensagem", "Tipo", "Ativo"]);
    sheetAvisos.getRange("A1:E1").setFontWeight("bold").setBackground("#D97706").setFontColor("#FFFFFF");

    sheetAvisos.appendRow([
      "aviso_massa",
      "Fornadas com Massa de 48 Horas",
      "Nossa massa descansa 48h em câmara fria para máxima leveza e bordas alveoladas. Produção diária limitada!",
      "Destaque",
      "SIM"
    ]);

    sheetAvisos.appendRow([
      "aviso_cafe",
      "Manhãs de Café Especial",
      "De terça a domingo, a partir das 07h30, croissants folhados e cafés especiais preparados na hora.",
      "Informativo",
      "SIM"
    ]);
  }
}

/**
 * Lê a aba Config como objeto chave-valor
 */
function readConfigSheet(ss) {
  const sheet = ss.getSheetByName(SHEET_CONFIG);
  if (!sheet) return {};
  const data = sheet.getDataRange().getValues();
  const config = {};
  for (let i = 1; i < data.length; i++) {
    const key = String(data[i][0]).trim();
    if (key) {
      config[key] = data[i][1];
    }
  }
  return config;
}

/**
 * Lê abas de cardápio (CafeManha ou PizzasNoite)
 */
function readMenuSheet(ss, sheetName) {
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet) return [];
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];

  const headers = data[0].map(h => String(h).trim().toLowerCase());
  const items = [];

  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (!row[0] && !row[2]) continue;

    const item = {};
    for (let j = 0; j < headers.length; j++) {
      item[headers[j]] = row[j];
    }

    // Normaliza status
    const statusRaw = String(item.status || "Disponível").trim();
    if (statusRaw.toLowerCase().includes("esgotado")) {
      item.status = "Esgotado";
    } else if (statusRaw.toLowerCase().includes("destaque")) {
      item.status = "Destaque do Dia";
    } else {
      item.status = "Disponível";
    }

    items.push(item);
  }
  return items;
}

/**
 * Lê aba Avisos
 */
function readAvisosSheet(ss) {
  const sheet = ss.getSheetByName(SHEET_AVISOS);
  if (!sheet) return [];
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];

  const headers = data[0].map(h => String(h).trim().toLowerCase());
  const avisos = [];

  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (!row[0] && !row[1]) continue;

    const aviso = {};
    for (let j = 0; j < headers.length; j++) {
      aviso[headers[j]] = row[j];
    }
    avisos.push(aviso);
  }
  return avisos;
}

/**
 * Grava valores na aba Config
 */
function writeConfigSheet(ss, configObj) {
  const sheet = ss.getSheetByName(SHEET_CONFIG);
  if (!sheet) return;
  const data = sheet.getDataRange().getValues();
  const keyRowMap = {};
  for (let i = 1; i < data.length; i++) {
    keyRowMap[String(data[i][0]).trim()] = i + 1;
  }

  for (const key in configObj) {
    if (keyRowMap[key]) {
      sheet.getRange(keyRowMap[key], 2).setValue(configObj[key]);
    } else {
      sheet.appendRow([key, configObj[key], "Atualizado via Painel Admin"]);
    }
  }
}

/**
 * Grava ou atualiza itens de cardápio (CafeManha ou PizzasNoite)
 */
function writeMenuSheet(ss, sheetName, items) {
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet) return;

  const itemList = Array.isArray(items) ? items : [items];
  if (itemList.length === 0) return;

  const data = sheet.getDataRange().getValues();
  const idRowMap = {};
  for (let i = 1; i < data.length; i++) {
    const id = String(data[i][0]).trim();
    if (id) idRowMap[id] = i + 1;
  }

  itemList.forEach(item => {
    const itemId = String(item.id || "").trim();
    if (!itemId) return;

    const rowData = [
      itemId,
      item.categoria || "Geral",
      item.nome || "",
      item.descricao || "",
      String(item.preco || item.preco_r$ || "0.00").replace(',', '.'),
      item.status || "Disponível",
      item.destaque || "NÃO",
      item.ativo !== undefined ? item.ativo : "SIM"
    ];

    if (idRowMap[itemId]) {
      sheet.getRange(idRowMap[itemId], 1, 1, 8).setValues([rowData]);
    } else {
      sheet.appendRow(rowData);
    }
  });
}

/**
 * Grava ou atualiza avisos
 */
function writeAvisosSheet(ss, avisos) {
  const sheet = ss.getSheetByName(SHEET_AVISOS);
  if (!sheet) return;

  const avisoList = Array.isArray(avisos) ? avisos : [avisos];
  if (avisoList.length === 0) return;

  const data = sheet.getDataRange().getValues();
  const idRowMap = {};
  for (let i = 1; i < data.length; i++) {
    const id = String(data[i][0]).trim();
    if (id) idRowMap[id] = i + 1;
  }

  avisoList.forEach(aviso => {
    const avisoId = String(aviso.id || "").trim();
    if (!avisoId) return;

    const rowData = [
      avisoId,
      aviso.titulo || "",
      aviso.mensagem || "",
      aviso.tipo || "Informativo",
      aviso.ativo !== undefined ? aviso.ativo : "SIM"
    ];

    if (idRowMap[avisoId]) {
      sheet.getRange(idRowMap[avisoId], 1, 1, 5).setValues([rowData]);
    } else {
      sheet.appendRow(rowData);
    }
  });
}

/**
 * Atualiza rapidamente o status de um item específico
 */
function updateItemStatus(ss, sheetName, itemId, newStatus) {
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet) return false;
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]).trim() === String(itemId).trim()) {
      sheet.getRange(i + 1, 6).setValue(newStatus); // Coluna F = Status
      return true;
    }
  }
  return false;
}

/**
 * Atualiza o carimbo de data/hora na aba Config
 */
function updateTimestamp(ss) {
  const sheet = ss.getSheetByName(SHEET_CONFIG);
  if (!sheet) return;
  const now = new Date().toISOString();
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]).trim() === "ultima_atualizacao") {
      sheet.getRange(i + 1, 2).setValue(now);
      return;
    }
  }
  sheet.appendRow(["ultima_atualizacao", now, "Carimbo da última modificação"]);
}

/**
 * Função utilitária para inicialização manual das 4 abas no Editor
 */
function setupInitialSheets() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  ensureStructure(ss);
  SpreadsheetApp.flush();
  Logger.log("Planilhas e abas do Espaço ITU inicializadas com sucesso!");
}
