#include <iostream>
#include <string>
#include <cstring>
#include <windows.h>

__declspec(noinline) bool VerifyKey(const char* inputKey) {
    const char targetKey[] = "CRACKME-2026-X64DBG-KEY";
    return (strcmp(inputKey, targetKey) == 0);
}

__declspec(noinline) void OnSuccess() {
    std::cout << "\n============================================\n";
    std::cout << " [+] [SUCCESS] Key Verified Successfully!\n";
    std::cout << " [+] ACCESS GRANTED: Welcome, Authorized User!\n";
    std::cout << " [+] Secret Token: FLAG{x64dbg_mcp_reverse_success}\n";
    std::cout << "============================================\n";
}

__declspec(noinline) void OnFailure(const char* inputKey) {
    std::cout << "\n[-] [FAILED] Invalid Key: \"" << inputKey << "\"\n";
    std::cout << "[-] ACCESS DENIED! Please try again.\n";
}

int main() {
    SetConsoleTitleA("Target App - Key Verification CrackMe");
    std::cout << "============================================\n";
    std::cout << "    Key Verification Login System v1.0      \n";
    std::cout << "    (Target Binary for x64dbg Analysis)     \n";
    std::cout << "============================================\n\n";

    std::cout << "Enter your License Key: ";
    std::string userKey;
    if (!std::getline(std::cin, userKey) || userKey.empty()) return 1;

    // Target conditional jump for /patch command
    if (VerifyKey(userKey.c_str())) {
        OnSuccess();
    } else {
        OnFailure(userKey.c_str());
    }

    std::cout << "\nPress ENTER to exit...";
    std::cin.get();
    return 0;
}
