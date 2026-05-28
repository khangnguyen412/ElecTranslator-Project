from deep_translator import GoogleTranslator

translator = GoogleTranslator(source='auto', target='vi')

# source_language = "(喘气) .哈啊.. 放.. 放开我! 鸣... 你这混蛋...到底要折磨我到什么时 嗯哼...."
source_language = "(喘气) .哈啊.. 放.. 放开我! 鸣... 你这混蛋...到底要折磨我到什么时 嗯哼...."

try:
    # start translate
    ket_qua = translator.translate(source_language)
    
    # translate result
    print("--- KẾT QUẢ TEST ---")
    print(f"Gốc: {source_language}")
    print(f"Dịch: {ket_qua}")
    
except Exception as e:
    print(f"Đã xảy ra lỗi: {e}")


