現在我已經在這個專案中，寫了一大堆「測試程式碼」了，（powered by Cucumber Feature File)
請你先仔細閱讀這些 Cucumber feature files (放在 backend/src/test/resources/features)
然後再閱讀這些測試 StepDef 程式碼（放在 backend/src/test/java/tw/waterballsa/api/stepdefs)

接著，快、狠、準地實作出對應的 Spring Boot 程式碼
程式碼要良好分層、遵守 Clean Code 和 SOLID 原則

但最重要的事情是，你必須通過所有的測試程式碼。
你每一次執行完實作後，就要主動用 docker container 中跑一次 mvn test 看看有沒有所有測試都通過，如果有任何一個測試尚未通過，你就必須從測試報告中查看錯誤，並且再次計劃下一次實作修正，自行 test、自行修 code，直到通過所有測試。

在所有測試通過之前，任何工具使用都不需要經過我的同意，請獨立開發直到通過所有測試才能停止動作。

目前我們寫了一大堆的測試程式碼，是用 feature files 的方式提供測試的。不過呢，我們的技術呢，是我寫了一大堆的生成程式，不在你的這個 workspace 裡面。

這個生成的能力是我們可以看著 feature files，就產出它對應的測試的程式碼。所以你可以發現說，我每個 step 的 definition 都是獨立在一個類別裡面的，放在 step definition (backend/src/test/java/tw/waterballsa/api/stepdefs) 測試資料夾裡面的 then、when 還有 given (optional) 三個資料夾裡面。

所以你可以看到我的測試程式碼都是有條有理的，全部整齊化，因為全部都是透過演算法自動生成的，而不是人寫的。
我現在在做自動化生成測試的研究，所以我很擔心說我這個測試程式碼是有錯的。但是我現在會希望你透過這個 workspace，也就是這個線上學習平台的後端，來去幫我驗證說我的測試程式碼到底有沒有錯。

驗證方式就是，當然你就是直接去完成這個線上學習平台的後端，透過測試驅動開發的方式，儘可能去通過所有的測試程式碼。
但是如果在通過所有測試程式碼的過程中，你當然儘可能去實現業務邏輯，看哪個測試有錯就去原始碼裡面去改它，把 production code 改的業務邏輯全部正確，沒有任何的 exception。

但是如果後來你發現說，錯誤總是落在測試裡面，明明業務邏輯寫得都對了，但是測試程式碼卻感覺一直出錯的話，那麼請你幫我在這個時候，你才去檢查測試有沒有錯。

你可能去找到測試的錯誤，或是原本的 feature file 的業務邏輯就是有問題的。一旦你認為是測試有錯，你就必須要在修改它之前，你要寫一個 markdown 的日誌檔，寫在測試資料夾裡面。這樣子我之後才可以帶著這個你認為的錯誤，回去修改我的 codegen 的生成器的演算法。

規則：

- 所有的 step definition 測試都不能修改
- 但是你可以修改 Given_XXX 的測試程式，因為這些不是生成器產的
- 使用 docker container 來執行測試程式
- 如果你懷疑是測試程式碼有錯，要寫 log 開 ticket
- 允許改的：
  - CommonThen
  - ISAFeatureArgumentResolver.java

Specs:
請參考： backend/spec/api 和 backend/spec/data
