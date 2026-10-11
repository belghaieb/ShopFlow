package com.shopflow.config;

import com.shopflow.entity.*;
import com.shopflow.enums.CouponType;
import com.shopflow.enums.Role;
import com.shopflow.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final SellerProfileRepository sellerProfileRepository;
    private final CouponRepository couponRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        try {
            if (userRepository.count() > 0) {
                log.info("Database already initialized — skipping.");
                return;
            }
            seed();
        } catch (Exception e) {
            log.error("DataInitializer FAILED: {}", e.getMessage(), e);
        }
    }

    private void seed() {
        String pwd = passwordEncoder.encode("password123");

        // ADMIN
        User admin = new User();
        admin.setEmail("admin@shopflow.com"); admin.setMotDePasse(pwd);
        admin.setPrenom("Admin"); admin.setNom("ShopFlow");
        admin.setRole(Role.ADMIN); admin.setActif(true);
        admin.setAdresses(new ArrayList<>());
        userRepository.save(admin);

        // SELLER 1
        User seller1 = new User();
        seller1.setEmail("seller@shopflow.com"); seller1.setMotDePasse(pwd);
        seller1.setPrenom("Marie"); seller1.setNom("Dupont");
        seller1.setRole(Role.SELLER); seller1.setActif(true);
        seller1.setAdresses(new ArrayList<>());
        userRepository.save(seller1);
        SellerProfile sp1 = new SellerProfile();
        sp1.setUser(seller1); sp1.setNomBoutique("La Boutique Mode");
        sp1.setDescription("Vetements tendance pour toute la famille"); sp1.setNote(0.0);
        sellerProfileRepository.save(sp1);

        // SELLER 2
        User seller2 = new User();
        seller2.setEmail("seller2@shopflow.com"); seller2.setMotDePasse(pwd);
        seller2.setPrenom("Jean"); seller2.setNom("Martin");
        seller2.setRole(Role.SELLER); seller2.setActif(true);
        seller2.setAdresses(new ArrayList<>());
        userRepository.save(seller2);
        SellerProfile sp2 = new SellerProfile();
        sp2.setUser(seller2); sp2.setNomBoutique("Tech Express");
        sp2.setDescription("Les meilleurs produits high-tech"); sp2.setNote(0.0);
        sellerProfileRepository.save(sp2);

        // CLIENT
        User client = new User();
        client.setEmail("client@shopflow.com"); client.setMotDePasse(pwd);
        client.setPrenom("Alice"); client.setNom("Bernard");
        client.setRole(Role.CUSTOMER); client.setActif(true);
        client.setAdresses(new ArrayList<>());
        userRepository.save(client);

        // COUPONS
        saveCoupon("BIENVENUE10", CouponType.PERCENT, "10", "2026-12-31");
        saveCoupon("REMISE50",    CouponType.FIXED,   "50", "2026-06-30");
        saveCoupon("SUMMER20",    CouponType.PERCENT,  "20","2026-08-31");

        log.info("=================================================");
        log.info("✅ Ready! No products — sellers add their own.");
        log.info("   admin@shopflow.com   / password123  [ADMIN]");
        log.info("   seller@shopflow.com  / password123  [SELLER]");
        log.info("   seller2@shopflow.com / password123  [SELLER]");
        log.info("   client@shopflow.com  / password123  [CUSTOMER]");
        log.info("=================================================");
    }

    private void saveCoupon(String code, CouponType type, String valeur, String expiry) {
        Coupon c = new Coupon();
        c.setCode(code); c.setType(type);
        c.setValeur(new BigDecimal(valeur));
        c.setDateExpiration(LocalDateTime.parse(expiry + "T23:59:59"));
        c.setUsagesMax(500); c.setUsagesActuels(0); c.setActif(true);
        couponRepository.save(c);
    }
}
