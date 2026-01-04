
import { Quote } from './types';

export const HORSE_ICON = 'https://cdn-icons-png.flaticon.com/512/3062/3062415.png';

export const BG_PRESETS = [
  { name: 'Đêm Huyền Bí', url: 'https://images.unsplash.com/photo-1557683316-973673baf926?auto=format&fit=crop&w=1920&q=80' },
  { name: 'Hoàng Kim Luxury', url: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=1920&q=80' },
  { name: 'Sân Khấu Ánh Sáng', url: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1920&q=80' },
  { name: 'Vũ Trụ Cyber', url: 'https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?auto=format&fit=crop&w=1920&q=80' }
];

// Cập nhật giải thưởng thành các mốc doanh số
export const INITIAL_PRIZES = [
  { id: '1', name: '500 TRIỆU', count: 99, color: '#64748b', image: 'https://cdn-icons-png.flaticon.com/512/2535/2535556.png' }, // Bạc/Xám
  { id: '2', name: '1 TỶ', count: 99, color: '#22c55e', image: 'https://cdn-icons-png.flaticon.com/512/2489/2489756.png' },      // Xanh lá
  { id: '3', name: '1.5 TỶ', count: 99, color: '#3b82f6', image: 'https://cdn-icons-png.flaticon.com/512/9496/9496013.png' },    // Xanh dương
  { id: '4', name: '2 TỶ', count: 99, color: '#a855f7', image: 'https://cdn-icons-png.flaticon.com/512/5501/5501360.png' },      // Tím
  { id: '5', name: '3 TỶ', count: 99, color: '#f97316', image: 'https://cdn-icons-png.flaticon.com/512/6559/6559284.png' },      // Cam
  { id: '6', name: '4 TỶ', count: 99, color: '#ef4444', image: 'https://cdn-icons-png.flaticon.com/512/536/536056.png' }         // Đỏ
];

// Danh sách lời chúc theo yêu cầu
export const INITIAL_QUOTES: Quote[] = [
  // MỐC 1: 500 TRIỆU
  { id: '1-1', category: '500 TRIỆU', content: "Vũ trụ đang thử thách lòng kiên nhẫn của bạn đấy. Bạn thừa sức biến con số này thành số lẻ trong doanh thu của bạn!" },
  { id: '1-2', category: '500 TRIỆU', content: "Tín hiệu bị nhiễu rồi! Nội lực của bạn phải gấp 5 lần số này. Tái thiết lập mục tiêu ngay nào!" },
  { id: '1-3', category: '500 TRIỆU', content: "Đây là mức 'Khởi động nhẹ nhàng'. Bạn chỉ cần thở nhẹ cũng đạt được con số này, vậy nên chọn số khác nhé." },
  { id: '1-4', category: '500 TRIỆU', content: "Một bài test nhỏ về cái tôi. Bạn có chấp nhận con số này hay sẽ bứt phá mạnh mẽ hơn? Chắc chắn là không thể chấp nhận nổi con số này rồi - Quay lại đi" },
  { id: '1-5', category: '500 TRIỆU', content: "Năng lượng này hơi 'hiền'. Hãy đánh thức con hổ bên trong bạn dậy đi nào!" },
  { id: '1-6', category: '500 TRIỆU', content: "Số này chỉ sương sương thôi. Hãy cho mọi người thấy bạn mạnh mẽ thế nào nữa đi!" },
  { id: '1-7', category: '500 TRIỆU', content: "Vũ trụ bảo: 'Đùa tí thôi, chứ tầm của bạn phải cao hơn nhiều!'." },
  { id: '1-8', category: '500 TRIỆU', content: "Bạn là đại dương bao la, đừng tự nhốt mình trong cái ao nhỏ này nhé. Nó tù lắm!" },
  { id: '1-9', category: '500 TRIỆU', content: "Chắc chắn là máy chưa kịp load năng lượng khủng của bạn. Làm lại thôi nào!" },
  { id: '1-10', category: '500 TRIỆU', content: "Mức an toàn. Nhưng tôi biết bạn sinh ra không phải để chọn sự an toàn, đúng không?" },

  // MỐC 2: 1 TỶ
  { id: '2-1', category: '1 TỶ', content: "Đã có tín hiệu kết nối với vũ trụ, khởi đầu vững chắc cho hành trình đầy năng lượng. Tín hiệu này có vẻ hơi chập chờn, bạn có muốn thử lại không?" },
  { id: '2-2', category: '1 TỶ', content: "1 Tỷ - Con số tròn trĩnh để bắt đầu. Nhưng bạn xứng đáng với sự 'Đột phá' hơn là ổn định." },
  { id: '2-3', category: '1 TỶ', content: "Vũ trụ ghi nhận sự nỗ lực, nhưng chắc chưa đủ đâu, vẫn đang chờ đợi cú hích lớn hơn của bạn." },
  { id: '2-4', category: '1 TỶ', content: "Hạt giống niềm tin đã gieo, nhưng hơi bé, cần tưới thêm nhiều niềm tin để cây lớn nhanh hơn nữa." },
  { id: '2-5', category: '1 TỶ', content: "Mức này hơi 'dễ thở' quá so với bản lĩnh của bạn. Thử thách bản thân thêm chút nữa đi!" },
  { id: '2-6', category: '1 TỶ', content: "Bạn đang chạy roda à? Tăng tốc lên số 5 để về đích rực rỡ hơn nào." },
  { id: '2-7', category: '1 TỶ', content: "Một sự khởi đầu dễ thương. Nhưng năm 2026 là năm của bạn, bạn cần những điều phi thường hơn cơ!" },
  { id: '2-8', category: '1 TỶ', content: "Vũ trụ đang 'thả thính' nhẹ. Bạn có muốn đớp thính to hơn không?" },
  { id: '2-9', category: '1 TỶ', content: "Ghi nhận! Nhưng trực giác mách bảo rằng kho báu thực sự của bạn lớn hơn thế này nhiều." },
  { id: '2-10', category: '1 TỶ', content: "Bạn có chấp nhận với con số này không?. Hãy nhớ tiềm năng của bạn là vô hạn đấy nhé!" },

  // MỐC 3: 1.5 TỶ
  { id: '3-1', category: '1.5 TỶ', content: "Nền móng đã vững. Giờ là lúc xây nhà lầu xe hơi trên cái nền này." },
  { id: '3-2', category: '1.5 TỶ', content: "Trạng thái năng lượng ổn định. Bạn đang đi đúng hướng, chỉ cần thêm chút tốc độ thôi." },
  { id: '3-3', category: '1.5 TỶ', content: "Con số đẹp để làm bàn đạp. Hãy dùng nó để bật cao lên những tầng mây mới." },
  { id: '3-4', category: '1.5 TỶ', content: "Luật hấp dẫn đang bắt đầu vận hành. Hãy giữ vững tần số này nhé!" },
  { id: '3-5', category: '1.5 TỶ', content: "Bạn là thỏi nam châm hút sự đủ đầy, nhưng lực hút cần mạnh thêm chút nữa để hút gấp đôi sự đủ đầy." },
  { id: '3-6', category: '1.5 TỶ', content: "Vũ trụ gửi lời khen ngợi nhẹ nhàng. 2026 sẽ là năm bạn 'ấm' từ trong ra ngoài." },
  { id: '3-7', category: '1.5 TỶ', content: "Không tệ chút nào! Nhưng với hào quang của bạn, tôi kỳ vọng một sự chói lòa hơn." },
  { id: '3-8', category: '1.5 TỶ', content: "Dòng chảy này đang được khơi thông. Hãy để nó chảy mạnh mẽ hơn nữa." },
  { id: '3-9', category: '1.5 TỶ', content: "Bạn đang ở vùng 'Thoải mái'. Bước ra khỏi đó là thấy kho báu ngay!" },
  { id: '3-10', category: '1.5 TỶ', content: "1.5 Tỷ là chuyện nhỏ. Vấn đề là bạn muốn làm chuyện lớn đến mức nào thôi." },

  // MỐC 4: 2 TỶ
  { id: '4-1', category: '2 TỶ', content: "Đúng rồi, đây là thứ bạn có thể làm được. Mọi thứ bắt đầu trở nên dễ dàng hơn rồi!" },
  { id: '4-2', category: '2 TỶ', content: "Cột mốc này! Vũ trụ đang mỉm cười với sự nỗ lực của bạn." },
  { id: '4-3', category: '2 TỶ', content: "Wow, hào quang của bạn bắt đầu làm chói mắt người đối diện rồi đấy!" },
  { id: '4-4', category: '2 TỶ', content: "Đẳng cấp là đây! Vũ trụ đang sắp xếp mọi nguồn lực để phục vụ bạn." },
  { id: '4-5', category: '2 TỶ', content: "Bạn là minh chứng sống cho việc: Khi tâm khởi, trùng trùng duyên khởi." },
  { id: '4-6', category: '2 TỶ', content: "Cánh cửa kho báu đang mở hé. Đẩy mạnh thêm chút lực nữa là toang cửa ngay!" },
  { id: '4-7', category: '2 TỶ', content: "Bạn là người gieo hạt cừ khôi. Mùa gặt 2026 hứa hẹn sẽ rất bội thu." },
  { id: '4-8', category: '2 TỶ', content: "Tuyệt vời! Bạn đang thu hút chính xác những gì bạn xứng đáng." },
  { id: '4-9', category: '2 TỶ', content: "Vũ trụ xác nhận: Tài khoản của bạn sắp ting ting liên tục rồi đấy." },
  { id: '4-10', category: '2 TỶ', content: "Giữ vững phong độ này nhé, bạn đang là ngôi sao sáng của bầu trời RNI." },

  // MỐC 5: 3 TỶ
  { id: '5-1', category: '3 TỶ', content: "Bạn đang chạm tay vào phiên bản rực rỡ nhất của chính mình!" },
  { id: '5-2', category: '3 TỶ', content: "3 Tỷ! Sức mạnh nội tại của bạn đang bùng nổ như núi lửa." },
  { id: '5-3', category: '3 TỶ', content: "Vũ trụ đang gửi đến bạn những 'đơn hàng' siêu to khổng lồ. Hãy mở rộng dung lượng trái tim để đón nhận." },
  { id: '5-4', category: '3 TỶ', content: "Bạn là bậc thầy của nghệ thuật truyền cảm hứng. Khách hàng không thể chối từ!" },
  { id: '5-5', category: '3 TỶ', content: "Năng lượng thịnh vượng đang bao trùm lấy bạn. Đi đâu cũng gặp quý nhân." },
  { id: '5-6', category: '3 TỶ', content: "Quá tuyệt vời! Bạn đang viết lại định nghĩa về sự thành công của năm 2026." },
  { id: '5-7', category: '3 TỶ', content: "Mục tiêu này dành cho những người có 'thần kinh thép' và trái tim nóng. Chính là bạn!" },
  { id: '5-8', category: '3 TỶ', content: "Không cần nói nhiều. Kết quả sẽ chứng minh bạn là ai!" },
  { id: '5-9', category: '3 TỶ', content: "3 Tỷ là con số biết nói. Nó nói rằng: Bạn rất xuất sắc!" },
  { id: '5-10', category: '3 TỶ', content: "Vũ trụ đã đóng dấu 'Kiểm duyệt' cho sự thành công của bạn năm nay." },

  // MỐC 6: 4 TỶ
  { id: '6-1', category: '4 TỶ', content: "4 Tỷ! Bạn đang kiến tạo nên một đế chế cho riêng mình!" },
  { id: '6-2', category: '4 TỶ', content: "Sức mạnh vô hạn! Bạn đã khai phá được kho báu tiềm thức của mình rồi." },
  { id: '6-3', category: '4 TỶ', content: "Bạn không thuộc về Trái Đất này nữa, bạn là người của hành tinh 'RỰC RỠ'!" },
  { id: '6-4', category: '4 TỶ', content: "Bạn là ngọn hải đăng soi đường cho cả team. Ánh sáng này quá rực rỡ." },
  { id: '6-5', category: '4 TỶ', content: "Không có đỉnh cao nào là bạn không thể chinh phục. Con số này chỉ là chuyện nhỏ." },
  { id: '6-6', category: '4 TỶ', content: "Cả vũ trụ đang nghiêng mình trước sự quyết tâm của bạn. Quá nể phục!" },
  { id: '6-7', category: '4 TỶ', content: "Vũ trụ đang trải thảm đỏ mời bạn bước lên bục vinh quang." },
  { id: '6-8', category: '4 TỶ', content: "Không từ ngữ nào diễn tả được sự vĩ đại này. Chỉ biết nói: QUÁ ĐỈNH!" },
  { id: '6-9', category: '4 TỶ', content: "Thần tài đang gõ cửa, à không, Thần tài đang dọn hẳn vào nhà bạn ở rồi!" },
  { id: '6-10', category: '4 TỶ', content: "Một năm 2026 không thể rực rỡ hơn. Chúc mừng siêu nhân!" }
];

export const MUSIC_PLAYLIST = [
  { name: 'Nhạc Xổ Số (Kiến Thiết)', url: 'https://raw.githubusercontent.com/hoangjustinseo-ctrl/vongquaymayman/main/nhac-xo-so.mp3' },
  { name: 'Epic Horse Race', url: 'https://cdn.pixabay.com/audio/2022/01/18/audio_d0a13f69d2.mp3' },
  { name: 'Hội Chợ Vui Nhộn', url: 'https://cdn.pixabay.com/audio/2022/03/15/audio_73f089693c.mp3' },
  { name: 'Cinematic Winner', url: 'https://cdn.pixabay.com/audio/2024/02/07/audio_03d3600938.mp3' }
];

export const WIN_SOUNDS = [
  { name: 'Pháo Hoa & Reo Hò', url: 'https://cdn.pixabay.com/audio/2021/08/04/audio_12b0c7443c.mp3' },
  { name: 'Ting Ting Tài Khoản', url: 'https://cdn.pixabay.com/audio/2021/08/04/audio_e6583996d9.mp3' },
  { name: 'Kèn Trumpet Thắng Lợi', url: 'https://cdn.pixabay.com/audio/2022/03/10/audio_55a293b6e7.mp3' }
];

export const DEFAULT_BG_MUSIC = MUSIC_PLAYLIST[0].url;
export const DEFAULT_WIN_SOUND = WIN_SOUNDS[0].url;
