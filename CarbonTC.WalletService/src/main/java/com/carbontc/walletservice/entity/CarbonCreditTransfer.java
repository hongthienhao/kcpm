package com.carbontc.walletservice.entity;


import java.math.BigDecimal;
import java.time.OffsetDateTime;

import com.carbontc.walletservice.entity.status.TransferStatus;
import com.carbontc.walletservice.entity.status.TransferType;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Data;

@Entity
@Table(name = "carbon_credit_transfers")
@Data
public class CarbonCreditTransfer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long transferId;

    @ManyToOne
    @JoinColumn(name = "from_wallet_id")
    private CarbonWallets fromWallet;

    @ManyToOne
    @JoinColumn(name = "to_wallet_id")
    private CarbonWallets toWallet;

    @Column(name = "total_price")
    private BigDecimal totalPrice;

    @Enumerated(EnumType.STRING)
    @Column(name = "status",nullable = false, length = 20)
    private TransferStatus status;

    private BigDecimal amount;

    @Enumerated(EnumType.STRING)
    @Column(name = "transfer_type", nullable = false, length = 20)
    private TransferType transferType;

    private String referenceId; // TransactionId or ListingId

    private OffsetDateTime createdAt;

}
