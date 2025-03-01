import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Book } from '../models/entities/book.entity';
import { Repository } from 'typeorm';
import { CreateBookDto } from '../models/dto/create-book.dto';
import { CommonErrors } from 'src/shared/errors/common/common-errors';
import { BookErrors } from 'src/shared/errors/book/book.errors';
import { UpdateBookDto } from '../models/dto/update-book.dto';

@Injectable()
export class BooksService {

    constructor(@InjectRepository(Book) private bookRepository: Repository<Book>) { }

    async createBook(createbookDto:CreateBookDto, username: string): Promise<Book> {
        createbookDto.created_by = username;
        createbookDto.updated_by = username;
        createbookDto.name = createbookDto.name.toUpperCase();

        const bookDB = await this.findBookByName(createbookDto.name);
        if(bookDB){
            throw new NotFoundException(BookErrors.Conflict);
        } 

        const book = await this.bookRepository.create(createbookDto);
        await book.save();

        return book;
    }

    /* get all books */
    async getAllBooks(): Promise<Book[]> {
        try {
           return await this.bookRepository.find({
            select: {
                id: true,
                name: true,
                description: true,
                status: true,
                access_book_num: true,
                number: true,
                classs: true,
                title: true,
                edition: true,
                volumes: true,
                pages: true,
                source_of_fund: true,
                cost_price: true,
                year: true,
                remarks: true,  
                created_at: true,
                updated_at: true,
                created_by: true,
                updated_by: true
            },
            relations:['author', 'category', 'publisher'],
           });
        } catch (err) {
            throw new InternalServerErrorException(CommonErrors.ServerError);
        }
    }

    /* find book by id */
    async findBookById(id:number): Promise<Book> {
        const book = await this.bookRepository.findOne({
            where: {id: id},
            relations:['author', 'category', 'publisher']
        });
        if(!book){
            throw new NotFoundException(BookErrors.BookNotFound);
        } 

        try {
            return await book;
        } catch (err) {
            throw new InternalServerErrorException(CommonErrors.ServerError);
        }
        
    }

    async updateBook(
        bookId: number, 
        updateBookDto: UpdateBookDto, 
        username: string): Promise<Book> 
    {
        const book = await this.bookRepository.findOne({where: {id: bookId}});
    
        if (!book) {
          throw new NotFoundException(BookErrors.BookNotFound);
        }
    
        // Update book fields
        book.name = updateBookDto.name;
        book.description = updateBookDto.description;
        book.status = updateBookDto.status;
        book.author = updateBookDto.author;
        book.category = updateBookDto.category;
        book.publisher = updateBookDto.publisher;
        book.access_book_num = updateBookDto.access_book_num;
        book.number = updateBookDto.number;
        book.classs = updateBookDto.classs;
        book.title = updateBookDto.title;
        book.edition = updateBookDto.edition;
        book.volumes = updateBookDto.volumes;
        book.pages = updateBookDto.pages;
        book.source_of_fund = updateBookDto.source_of_fund;
        book.cost_price = updateBookDto.cost_price;
        book.year = updateBookDto.year;
        book.remarks = updateBookDto.remarks; 
        book.updated_by = username;
    
        // Save updated book
        await this.bookRepository.save(book);
        return book;
      }

    async findBookByName(bookName: string) {
        return await Book.findOne({
            where: {
                name: bookName,
            },
        });
    }
}
