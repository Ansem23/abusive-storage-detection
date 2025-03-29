// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract StockageLait {
    address public admin;

    // Stock de lait déclaré par chaque vendeur
    mapping(address => uint256) public stockLaitVendeurs;

    // Limite maximale autorisée par vendeur
    uint256 public limiteStockLait = 1000;

    // Événements pour suivi
    event LaitAjoute(address indexed vendeur, uint256 quantite);
    event StockAbusifDetecte(address indexed vendeur, uint256 quantiteTotale);

    constructor() {
        admin = msg.sender;
    }

    // Vendeur déclare un ajout de stock de lait
    function ajouterStockLait(uint256 quantite) public {
        stockLaitVendeurs[msg.sender] += quantite;
        emit LaitAjoute(msg.sender, quantite);

        if (stockLaitVendeurs[msg.sender] > limiteStockLait) {
            emit StockAbusifDetecte(msg.sender, stockLaitVendeurs[msg.sender]);
        }
    }

    // L’admin peut ajuster la limite maximale de stockage
    function definirLimiteStock(uint256 nouvelleLimite) public {
        require(msg.sender == admin, "Seul l'admin peut modifier la limite.");
        limiteStockLait = nouvelleLimite;
    }

    // Lecture du stock d’un vendeur
    function consulterStockLait(address vendeur) public view returns (uint256) {
        return stockLaitVendeurs[vendeur];
    }
}
