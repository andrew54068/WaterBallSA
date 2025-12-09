package tw.waterballsa.api.stepdefs.given;

import io.cucumber.datatable.DataTable;
import io.cucumber.java.en.Given;
import org.springframework.beans.factory.annotation.Autowired;
import tw.waterballsa.api.entity.Coupon;
import tw.waterballsa.api.repository.CouponRepository;
import tw.waterballsa.api.stepdefs.helper.ISAFeatureArgumentResolver;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;

public class Given_Coupon {

    @Autowired
    private CouponRepository couponRepository;

    @Autowired
    private ISAFeatureArgumentResolver resolver;

    @Given("準備一張Coupon, with table:")
    public void prepareCoupon(DataTable dataTable) {
        List<Map<String, String>> rows = dataTable.asMaps(String.class, String.class);

        for (Map<String, String> row : rows) {
            // Parse logic similar to other Given steps, but focusing on Coupon fields
            String validFromStr = (String) resolver.resolveVariable(row.get("validFrom"));
            String validToStr = (String) resolver.resolveVariable(row.get("validTo"));

            Coupon coupon = Coupon.builder()
                    .code(row.get("code"))
                    .discountType(row.get("discountType"))
                    .discountValue(Double.parseDouble(row.get("discountValue")))
                    .validFrom(parseTime(validFromStr))
                    .validTo(parseTime(validToStr))
                    .usageLimit(Integer.parseInt(row.get("usageLimit")))
                    .build();

            couponRepository.save(coupon);
        }
    }

    private LocalDateTime parseTime(String timeStr) {
        if (timeStr == null)
            return null;
        Object resolved = resolver.resolveVariable(timeStr);
        String resolvedStr = resolved.toString();

        // Manually handle @time functionality to avoid regex issues
        String cleanStr = resolvedStr.replace("\"", "").replace("'", "");
        if (cleanStr.startsWith("@time")) {
            int start = cleanStr.indexOf("(") + 1;
            int end = cleanStr.lastIndexOf(")");
            if (start > 0 && end > start) {
                resolvedStr = cleanStr.substring(start, end);
            }
        }

        if (!resolvedStr.contains("T") && !resolvedStr.contains(" ")) {
            resolvedStr += "T00:00:00";
        }
        return LocalDateTime.parse(resolvedStr);
    }
}
