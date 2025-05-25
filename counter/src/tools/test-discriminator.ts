import { createHash } from 'crypto';

/**
 * 对输入的字符串进行sha256加密，返回加密后的十六进制字符串
 * @param input 输入字符串
 * @returns sha256加密后的十六进制字符串
 */
function sha256(input: string): string {
    return createHash('sha256').update(input).digest('hex');
}


/**
 * 将十六进制字符串转换为十进制数组
 * @param hexStr 十六进制字符串
 * @returns 十进制数组
 */
function hex2decArray(hexStr: string): number[] {
    const result: number[] = [];
    // Remove any whitespace and ensure even length
    const cleanHex = hexStr.replace(/\s+/g, '');
    for (let i = 0; i < cleanHex.length; i += 2) {
        const hexPair = cleanHex.substr(i, 2);
        if (hexPair.length === 2) {
            result.push(parseInt(hexPair, 16));
        }
    }
    return result;
}

/**
 * 指令函数的鉴别器是 global: + 函数名 的sha256的哈希值的前8个字节.
 * @param functionName 
 */
function discriminatorFun(functionName: string): number[] {
    const sss = "global:" + functionName;
    const s256 = sha256(sss);
    console.log(`${sss} 的 sha256哈希值是: ${s256}`);
    const discriminator = hex2decArray(s256.substring(0, 16));
    console.log("\n**************************************************");
    console.log(`指令 ${functionName} 的discriminator是: [${discriminator}]`);
    console.log("**************************************************\n");
    return discriminator;
}

/**
 * 账户类型的鉴别器是 account: + 账户名 的sha256的哈希值的前8个字节.
 * @param functionName 
 */
function discriminatorAcctType(acctTypeName: string): number[] {
    const sss = "account:" + acctTypeName;
    const s256 = sha256(sss);
    console.log(`${sss} 的 sha256哈希值是: ${s256}`);
    const discriminator = hex2decArray(s256.substring(0, 16));
    console.log("\n**************************************************");
    console.log(`账户类型 ${acctTypeName} 的discriminator是: [${discriminator}]`);
    console.log("**************************************************\n");
    return discriminator;
}




discriminatorFun("initialize");

discriminatorAcctType("Counter");