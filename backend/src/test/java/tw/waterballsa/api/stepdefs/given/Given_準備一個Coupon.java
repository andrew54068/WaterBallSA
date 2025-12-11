package tw.waterballsa.api.stepdefs.given;

import io.cucumber.datatable.DataTable;
import io.cucumber.java.en.Given;
import org.springframework.beans.factory.annotation.Autowired;
import tw.waterballsa.api.entity.Coupon;
import tw.waterballsa.api.repository.CouponRepository;
import tw.waterballsa.api.stepdefs.helper.ISAFeatureArgumentResolver;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

public class Given_準備一個Coupon {

    @Autowired
    private CouponRepository couponRepository;

    @Autowired
    private ISAFeatureArgumentResolver resolver;

    @Given("準備一個Coupon, with table:")
    public void prepareCoupon(DataTable dataTable) {
        List<Map<String, String>> rows = dataTable.asMaps(String.class, String.class);
        List<String> headers = dataTable.row(0);

        for (Map<String, String> row : rows) {
            Coupon.CouponBuilder builder = Coupon.builder();

            if (row.containsKey("code")) {
                Object resolved = resolver.resolveVariable(row.get("code"));
                builder.code(resolved != null ? resolved.toString() : null);
            }

            if (row.containsKey("discountType")) {
                Object resolved = resolver.resolveVariable(row.get("discountType"));
                if (resolved != null) {
                    builder.discountType(Coupon.DiscountType.valueOf(resolved.toString()));
                }
            }

            if (row.containsKey("discountValue")) {
                Object resolved = resolver.resolveVariable(row.get("discountValue"));
                builder.discountValue(resolver.convertValue(resolved.toString(), BigDecimal.class));
            }

            if (row.containsKey("validFrom")) {
                Object resolved = resolver.resolveVariable(row.get("validFrom"));
                if (resolved != null) {
                    builder.validFrom(resolver.convertValue(resolved.toString(), LocalDateTime.class));
                }
            } else {
                builder.validFrom(LocalDateTime.now().minusDays(1));
            }

            if (row.containsKey("validUntil")) {
                Object resolved = resolver.resolveVariable(row.get("validUntil"));
                if (resolved != null) {
                    builder.validUntil(resolver.convertValue(resolved.toString(), LocalDateTime.class));
                }
            } else {
                builder.validUntil(LocalDateTime.now().plusDays(30));
            }

            if (row.containsKey("usageLimit")) {
                Object resolved = resolver.resolveVariable(row.get("usageLimit"));
                if (resolved != null && !resolved.toString().isEmpty()) {
                    builder.usageLimit(resolver.convertValue(resolved.toString(), Integer.class));
                }
            }

            if (row.containsKey("usageCount")) {
                Object resolved = resolver.resolveVariable(row.get("usageCount"));
                builder.usageCount(resolver.convertValue(resolved.toString(), Integer.class));
            }

            if (row.containsKey("isActive")) {
                Object resolved = resolver.resolveVariable(row.get("isActive"));
                builder.isActive(resolver.convertValue(resolved.toString(), Boolean.class));
            }

            // Save entity
            Coupon coupon = couponRepository.save(builder.build());

            // Extract and store variables
            List<String> dataRow = dataTable.row(rows.indexOf(row) + 1);
            for (int i = 0; i < headers.size(); i++) {
                String header = headers.get(i);
                if (header.startsWith(">")) {
                    String varName = header.substring(1).trim();
                    if (varName.contains(".id") || varName.equals("id")) {
                        resolver.storeVariable(varName, coupon.getId());
                    }
                } else if (header.startsWith("<")) {
                    String varName = header.substring(1).trim();
                    resolver.storeVariable(varName, coupon.getId());
                }
            }
        }
    }
}
