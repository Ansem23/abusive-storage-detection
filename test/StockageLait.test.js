const StockageLait = artifacts.require("StockageLait");

contract("StockageLait", accounts => {
  const [admin, vendeur1] = accounts;

  it("doit déployer le contrat et définir le bon admin", async () => {
    const instance = await StockageLait.deployed();
    const adminStocké = await instance.admin();
    assert.equal(adminStocké, admin, "L'adresse admin doit être celle du déployeur");
  });

  it("doit permettre à un vendeur d'ajouter du stock de lait et émettre un événement", async () => {
    const instance = await StockageLait.deployed();
    const tx = await instance.ajouterStockLait(600, { from: vendeur1 });

    assert.equal(tx.logs[0].event, "LaitAjoute", "L'événement LaitAjoute doit être émis");

    const stock = await instance.consulterStockLait(vendeur1);
    assert.equal(stock.toString(), "600", "Le stock de lait doit être 600");
  });

  it("doit détecter un stockage abusif et émettre l'événement StockAbusifDetecte", async () => {
    const instance = await StockageLait.deployed();

    const tx = await instance.ajouterStockLait(500, { from: vendeur1 }); // total = 1100

    const events = tx.logs.map(log => log.event);
    assert.include(events, "StockAbusifDetecte", "L'événement StockAbusifDetecte doit être émis");

    const stock = await instance.consulterStockLait(vendeur1);
    assert.equal(stock.toString(), "1100", "Le stock total doit être 1100");
  });
});
