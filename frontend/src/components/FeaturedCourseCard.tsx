"use client";

import { useRouter } from "next/navigation";
import { Box, Flex, Text, Badge, Button, createToaster } from "@chakra-ui/react";
import { useAuth } from "@/lib/auth-context";

const toaster = createToaster({
  placement: "top",
  duration: 3000,
});

interface FeaturedCourseCardProps {
  id: number;
  title: string;
  provider: string;
  description: string;
  image: string;
  hasCoupon?: boolean;
  couponValue?: number;
  isPurchased?: boolean;
  hasFreeTrial?: boolean;
  isPaidOnly?: boolean;
  firstFreeLessonIndex?: number;
  firstFreeChapterIndex?: number;
}

export function FeaturedCourseCard({
  id,
  title,
  provider,
  description,
  image,
  hasCoupon = false,
  couponValue,
  isPurchased = false,
  hasFreeTrial = false,
  isPaidOnly = false,
  firstFreeLessonIndex,
  firstFreeChapterIndex,
}: FeaturedCourseCardProps) {
  const router = useRouter();
  const { user } = useAuth();

  const handleFreeTrialClick = () => {
    if (!user) {
      toaster.create({
        title: "請先登入",
        description: "請先登入後才能體驗課程",
        type: "warning",
      });
      // Scroll to top where login button is
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    router.push(`/course/${id}/chapters/${firstFreeChapterIndex}/lessons/${firstFreeLessonIndex}`);
  };

  const handlePurchaseClick = () => {
    if (!user) {
      toaster.create({
        title: "請先登入",
        description: "請先登入後才能購買課程",
        type: "warning",
      });
      // Scroll to top where login button is
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    router.push(`/curriculums/${id}`);
  };

  return (
    <Box
      role="group"
      position="relative"
      bg="dark.800"
      borderRadius="2xl"
      overflow="hidden"
      borderWidth="2px"
      borderColor="accent.yellow"
      transition="all 0.3s"
      _hover={{ borderColor: "accent.yellow" }}
    >
      {/* Hero Image */}
      <Box
        position="relative"
        h="256px"
        bgGradient="linear(to-br, dark.700, dark.900)"
        overflow="hidden"
      >
        {image && (
          <Flex w="full" h="full" align="center" justify="center" p={8}>
            <Box position="relative" w="full" h="full">
              {/* Placeholder for course hero visual */}
              <Box
                position="absolute"
                inset={0}
                bgGradient="linear(to-br, blue.600, purple.600, pink.600)"
                opacity={0.2}
              />
              <Flex
                position="absolute"
                inset={0}
                align="center"
                justify="center"
              >
                <Box textAlign="center">
                  <Text fontSize="4xl" mb={4}>
                    🎯
                  </Text>
                  <Text fontSize="2xl" fontWeight="bold" color="white" mb={2}>
                    {title.substring(0, 10)}...
                  </Text>
                  <Text fontSize="sm" color="gray.300">
                    {provider}
                  </Text>
                </Box>
              </Flex>
            </Box>
          </Flex>
        )}

        {/* Status Badge */}
        <Box position="absolute" top={4} right={4}>
          <Badge
            px={4}
            py={1.5}
            borderRadius="full"
            fontSize="xs"
            fontWeight="bold"
            colorScheme={isPurchased ? "green" : undefined}
            bg={isPurchased ? "green.500" : "accent.yellow"}
            color={isPurchased ? "white" : "dark.900"}
          >
            {isPurchased ? "已購買" : "尚未購券"}
          </Badge>
        </Box>
      </Box>

      {/* Content */}
      <Box p={6}>
        {/* Title */}
        <Text
          fontSize="2xl"
          fontWeight="bold"
          color="white"
          mb={3}
          lineHeight="tight"
        >
          {title}
        </Text>

        {/* Provider Badge */}
        <Box
          display="inline-flex"
          alignItems="center"
          px={3}
          py={1.5}
          bg="rgba(247, 179, 43, 0.2)"
          borderWidth="1px"
          borderColor="rgba(247, 179, 43, 0.4)"
          borderRadius="full"
          mb={4}
        >
          <Text color="accent.yellow" fontWeight="semibold" fontSize="sm">
            {provider}
          </Text>
        </Box>

        {/* Description */}
        <Text color="gray.300" fontSize="sm" mb={6} lineClamp={2}>
          {description}
        </Text>

        {/* Coupon Banner */}
        {hasCoupon && couponValue && (
          <Box
            mb={4}
            p={3}
            bg="rgba(247, 179, 43, 0.1)"
            borderWidth="1px"
            borderColor="rgba(247, 179, 43, 0.3)"
            borderRadius="lg"
          >
            <Text
              color="accent.yellow"
              fontSize="sm"
              fontWeight="bold"
              textAlign="center"
            >
              你有一張 {couponValue.toLocaleString()} 折價券
            </Text>
          </Box>
        )}

        {/* Action Buttons */}
        <Flex gap={3}>
          {hasFreeTrial ? (
            <Button
              flex={1}
              px={6}
              py={3}
              bg="accent.yellow"
              color="dark.900"
              borderRadius="lg"
              fontWeight="bold"
              _hover={{ bg: "accent.yellow-dark" }}
              transition="all 0.2s"
              onClick={handleFreeTrialClick}
            >
              立刻體驗
            </Button>
          ) : (
            <Button
              flex={hasFreeTrial || isPaidOnly ? 1 : undefined}
              w={hasFreeTrial || isPaidOnly ? undefined : "full"}
              px={6}
              py={3}
              bg="transparent"
              borderWidth="2px"
              borderColor="rgba(255, 255, 255, 0.3)"
              color="white"
              borderRadius="lg"
              fontWeight="bold"
              _hover={{
                bg: "rgba(255, 255, 255, 0.1)",
                borderColor: "rgba(255, 255, 255, 0.5)",
              }}
              transition="all 0.2s"
              onClick={handlePurchaseClick}
            >
              立即購買
            </Button>
          )}
        </Flex>
      </Box>
    </Box>
  );
}
